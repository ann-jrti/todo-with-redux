import { ajaxRetry } from '../../modules/ajax_retry.js';
import { sentryBreadcrumb, sentryMessage } from '../../modules/sentry.js';
import {
  selectAnswer,
  getSelected,
  blockUI,
  unblockUI,
  isUIBlocked,
  enableSkipButton,
} from '../../modules/multi_choice_test.js';
import '../../modules/online_status_breadcrumbs.js';

const globalParams = document.querySelector('main').dataset;

let questionsAnswered = {}; // which questions have been answered
let questionsSeen = {}; // which questions have been seen (not necessarily answered)
let questionsStartTime = {}; // map from question_name to when question was first shown
let questionsData = {}; // maps questionIndex => { question_name: , prompt: [ base64svgs ], options: { name: base64svg}, optionOrder: [ permuted option names ], existing_selection: name of option|dontknow|noanswer }
let questionIndex = 0; // 0 = first question

let examples = []; // array of questions. Objects similar to questionsData, but with the added key 'correct', giving the correct answer
let exampleIndex = 0; // current example

let testStartTime = null; // the time the test started (first non-example question was shown)
let timerInterval = null; // javascript timer
let testIsDone = false;
let errorMessage = null;

function setPage(page) {
  const currentPage = document.getElementById(`page-${page}`);

  if (currentPage) {
    document
      .querySelectorAll('.cognitive_test-page')
      .forEach((e) => e.classList.add('is-hidden'));
    currentPage.classList.remove('is-hidden');
    return true;
  }
  return false;
}

function stateInstructions() {
  if (!examples.length) {
    document
      .querySelectorAll('.start-test-has_examples')
      .forEach((e) => e.classList.add('is-hidden'));
  }
  setPage('instructions');
}

function stateTnC() {
  setPage('termsAndConditions');
}

function stateAboutToStart() {
  setPage('aboutToStart');
}

function stateVerifyFinish() {
  if (globalParams.allowQuestionNavigation == 'true' && !testIsDone) {
    setPage('verifyFinish');
    updateTopBar();
    unblockUI();
  } else {
    nextState();
  }
}

function stateTestDone() {
  hideTopBar();
  clearInterval(timerInterval);
  if (globalParams['finishUrl']) {
    const url = globalParams['finishUrl'].replace(/REASON/, 'num_questions');
    const params = {
      url: url,
      type: 'POST',
      success: renderTestDone,
    };

    ajaxRetry(params, 'stateTestDone', handleAjaxError);
  } else {
    renderTestDone();
  }

  return true;
}

function renderTestDone() {
  setPage('testDone');
}

function stateError() {
  hideTopBar();
  clearInterval(timerInterval);
  window.onbeforeunload = null;
  setPage('error');
}

/* Permutation of options */

function populateOptionOrder(question) {
  Math.seedrandom(globalParams.randomSeed + question['question_name']);

  let order = [...Object.keys(question.options)];
  for (let i = order.length - 1; i >= 0; --i) {
    const x = Math.floor(Math.random() * i);
    const t = order[i];
    order[i] = order[x];
    order[x] = t;
  }
  question.optionOrder = order;
}

// Go from the index of the selection to the actual choice selected
function answerFromSelection(question, selected) {
  if (selected in question.optionOrder) {
    return question.optionOrder[selected];
  }
  console.assert(
    ['noanswer', 'dontknow'].includes(selected),
    'Invalid selection %d in answerFromSelection for question %s. optionOrder: %s',
    selected,
    question['question_name'],
    question.optionOrder
  );
  return selected;
}

function permutedOptionFromAnswer(question, answer) {
  if (question.optionOrder.includes(answer)) {
    return question.optionOrder.indexOf(answer);
  }
  console.assert(
    ['noanswer', 'dontknow'].includes(answer),
    'Invalid answer %s in answerFromSelection for question %s. optionOrder: %s',
    answer,
    question['question_name'],
    question.optionOrder
  );
  return answer;
}

function setupScale(question) {
  console.assert(
    parseInt(question.scale) > 0,
    'Question %s has no options, but I failed to parse scale %s',
    question['question_name'],
    question.scale
  );
  console.assert(
    ['+', '-'].includes(question.operator),
    'Question %s has no options, but I failed to parse operator %s',
    question['question_name'],
    question.operator
  );
  const options = [...Array(question.scale).keys()].map((x) => x + 1); // [1, ..., scale]
  if (question.operator == '+') {
    question.optionOrder = options;
  } else {
    question.optionOrder = options.reverse();
  }
}

/* Main question interface */

function questionTemplate(question) {
  sentryBreadcrumb({
    message: 'questionTemplate()',
    data: { questionName: question.question_name },
  });
  if (!question.optionOrder) {
    if (question.options) {
      populateOptionOrder(question);
    } else {
      setupScale(question);
    }
  }

  const prompts = document.querySelectorAll('.cognitive_test-prompt-image');
  prompts.forEach(function (img, i) {
    img.src = `data:image/svg+xml;base64,${question.prompts[i]}`;
  });

  const options = document.querySelectorAll('.cognitive_test-options_image');
  options.forEach(function (elem, i) {
    elem.classList.remove('correct_answer');
    if (i in question.optionOrder) {
      const img = elem.querySelector('img');
      img.src = `data:image/svg+xml;base64,${
        question.options[question.optionOrder[i]]
      }`;
      elem.classList.remove('is-hidden');
      if (
        'correct' in question &&
        question.correct == question.optionOrder[i]
      ) {
        elem.classList.add('correct_answer');
      }
    } else {
      elem.classList.add('is-hidden');
    }
  });

  if ('text' in question) {
    const personalityText = document.querySelectorAll(
      '.personality-test-statement'
    );
    personalityText.forEach((elem) => (elem.textContent = question.text));
  }

  if ('explanation' in question) {
    document.querySelector('.cognitive_test-explanation').innerHTML =
      question.explanation;
    document
      .querySelector('.cognitive_test-explanation')
      .classList.remove('is-hidden');
  } else {
    document
      .querySelector('.cognitive_test-explanation')
      ?.classList.add('is-hidden');
  }

  if (question['existing_selection']) {
    selectAnswer(
      permutedOptionFromAnswer(question, question['existing_selection'])
    );
  } else {
    selectAnswer(null);
  }

  unblockUI();
  setPage('test');
}

/* Blocks UI and does ajax call to upload answer. Callback is called
 * upon completion and is responsible for unblocking UI (possibly after
 * rendering the next question
 */
function saveCurrentlySelectedAnswer(callback) {
  blockUI();

  const question = questionsData[questionIndex];
  sentryBreadcrumb({
    message: 'saveCurrentlySelectedAnswer()',
    data: {
      questionIndex: questionIndex,
      questionsLoaded: Object.keys(questionsData),
      questionName: question.question_name,
      optionOrder: question.optionOrder,
      selected: getSelected(),
    },
  });
  const selectedAnswer = answerFromSelection(question, getSelected());
  const url = globalParams['answerUrl']
    .replace(/INDEX/, questionIndex)
    .replace(/CHOICE/, selectedAnswer);
  const params = {
    url: url,
    type: 'POST',
    success: callback,
    data: { choice: selectedAnswer },
  };

  question['existing_selection'] = selectedAnswer;
  questionsAnswered[questionIndex] = true;

  ajaxRetry(params, 'handleQuestionAnswered', handleAjaxError);
}

function handleQuestionAnswered(ev) {
  ev.preventDefault();
  blockUI();

  if (state == STATE_EXAMPLE) {
    const question = examples[exampleIndex];
    const selectedAnswer = answerFromSelection(question, getSelected());

    question['existing_selection'] = selectedAnswer;

    ++exampleIndex;
    return stateExample();
  } else if (state == STATE_QUESTIONS) {
    const callback = (data) => gotQuestionResponse(data, true);
    saveCurrentlySelectedAnswer(callback);
  } else {
    console.assert(
      false,
      'Invalid state in handleQuestionAnswered(): %d',
      state
    );
    location.reload();
  }
}
document
  .querySelectorAll('.intelligence_test-next_button')
  .forEach((button) =>
    button.addEventListener('click', handleQuestionAnswered)
  );

function handleAnswerClicked(ev) {
  if (state == STATE_QUESTIONS) {
    const callback = (data) => gotQuestionResponse(data, false);
    saveCurrentlySelectedAnswer(callback);
  }
}

function handleQuestionBackButton(ev) {
  ev.preventDefault();
  blockUI();
  console.assert(
    globalParams.allowQuestionNavigation == 'true',
    'Back button got pressed, but allowQuestionNavigation had state %s',
    globalParams.allowQuestionNavigation
  );
  if (state == STATE_QUESTIONS) {
    if (questionIndex > 0) {
      --questionIndex;
    }
    return stateQuestions();
  } else if (state == STATE_EXAMPLE) {
    if (exampleIndex > 0) {
      --exampleIndex;
      return stateExample();
    } else {
      prevState();
    }
  }
}
document
  .querySelectorAll('.intelligence_test-prev_button')
  .forEach((button) =>
    button.addEventListener('click', handleQuestionBackButton)
  );

function handleQuestionSkipButton(ev) {
  ev.preventDefault();
  blockUI();
  console.assert(
    globalParams.allowQuestionNavigation == 'true',
    'Skip button got pressed, but allowQuestionNavigation had state %s',
    globalParams.allowQuestionNavigation
  );
  console.assert(
    state == STATE_QUESTIONS,
    'Skip button got pressed, but state was %s, should be %s',
    state,
    STATE_QUESTIONS
  );
  if (questionIndex >= globalParams.totalNumQuestions - 1) {
    questionIndex = globalParams.totalNumQuestions - 1;
    nextState();
  } else {
    ++questionIndex;
    return stateQuestions();
  }
}

document
  .querySelectorAll('.intelligence_test-skip_button')
  .forEach((button) =>
    button.addEventListener('click', handleQuestionSkipButton)
  );

function handleBackToTest(ev) {
  console.assert(
    globalParams.allowQuestionNavigation == 'true',
    'Back to test button pressed, but allowQuestionNavigation had state %s',
    globalParams.allowQuestionNavigation
  );
  console.assert(
    state == STATE_VERIFY_FINISH,
    'Back to test button pressed, but state was %d. Expecting state to be %d',
    state,
    STATE_VERIFY_FINISH
  );

  state = STATE_QUESTIONS;
  return stateQuestions();
}
document
  .querySelectorAll('.cognitive_test-back_to_test')
  .forEach((button) => button.addEventListener('click', handleBackToTest));

function stateExample() {
  document
    .querySelector('.cognitive_test-example_instructions')
    ?.classList.remove('is-hidden');
  if (exampleIndex >= examples.length) {
    return nextState();
  }
  questionTemplate(examples[exampleIndex]);
}

function totalSecondsRemaining() {
  const timelim = parseInt(globalParams.timelimTotal);

  if (testStartTime) {
    const elapsedMillis = new Date() - testStartTime;
    const elapsedSec = Math.floor(elapsedMillis / 1000);

    return Math.max(0, timelim - elapsedSec);
  }

  return timelim;
}

function syncTimeWithServer(data) {
  console.assert(
    data.has_started,
    'in syncTimeWithServer, but test has not started',
    data
  );
  sentryBreadcrumb({
    message: 'syncTimeWithServer()',
    data: {
      has_finished: data.has_finished,
      started_since: data.started_since,
      timelimTotal: globalParams.timelimTotal,
    },
  });
  if (data.has_finished || data.started_since > globalParams.timelimTotal) {
    testIsDone = true;
    nextState();
  } else {
    testStartTime = new Date(new Date().getTime() - data.started_since * 1000);
    timerInterval = setInterval(testTimerUpdate, 1000);
  }
}

function testTimerUpdate() {
  const timeRemaining = totalSecondsRemaining();
  document.querySelector('.cognitive_test-timer-minutes').textContent =
    Math.floor(timeRemaining / 60);
  document.querySelector('.cognitive_test-timer-seconds').textContent =
    timeRemaining % 60;
  if (timeRemaining < 60) {
    document
      .querySelector('.cognitive_test-timer')
      ?.classList.add('is-low_time');
  } else {
    document
      .querySelector('.cognitive_test-timer')
      ?.classList.remove('is-low_time');
  }

  if (timeRemaining == 0) {
    clearInterval(timerInterval);
    const params = {
      url: globalParams.stateUrl,
      success: syncTimeWithServer,
    };
    ajaxRetry(params, 'testTimerUpdate', handleAjaxError);
  }
}

function gotQuestionResponse(data, updateCurrentQuestion) {
  if (data.result == 'done') {
    if (data.reason == 'timeout' || data.reason == 'finished') {
      testIsDone = true;
    }
    if (updateCurrentQuestion || testIsDone) {
      nextState();
      return;
    }
  } else if (data.result == 'question') {
    questionsData[data.index] = data;
    if (updateCurrentQuestion) {
      questionIndex = data.index;
      questionsSeen[data.index] = true;
    }
  }

  updateTopBar();
  questionTemplate(questionsData[questionIndex]);
}

function stateQuestions() {
  document
    .querySelector('.cognitive_test-example_instructions')
    ?.classList.add('is-hidden');
  if (testStartTime == null) {
    testStartTime = new Date();
  }
  if (
    'timelimTotal' in globalParams &&
    parseInt(globalParams.timelimTotal) > 0
  ) {
    document
      .querySelector('.cognitive_test-timer')
      .classList.remove('is-hidden');
    clearInterval(timerInterval);
    timerInterval = setInterval(testTimerUpdate, 1000);
  } else {
    document.querySelector('.cognitive_test-timer').classList.add('is-hidden');
  }

  updateTopBar();

  if (globalParams.allowQuestionNavigation == 'true') {
    enableSkipButton();
  }

  if (questionIndex in questionsData) {
    questionTemplate(questionsData[questionIndex]);
  } else {
    const url = globalParams['questionUrl'].replace(/INDEX/, questionIndex);

    let params = {
      url: url,
      success: (data) => gotQuestionResponse(data, true),
    };
    ajaxRetry(params, 'stateQuestions', handleAjaxError);
  }
}

/* Manage the task bar, showing the state of questions */

function updateTopBar() {
  const barItemStates = ['is-current', 'is-skipped', 'is-answered'];
  document.querySelector('#question_number').textContent =
    parseInt(questionIndex) + 1;
  document
    .querySelectorAll('.progress_bar-discrete-fill')
    .forEach(function (elem) {
      const i = elem.dataset.question;

      elem.classList.remove(...barItemStates);
      if (state == STATE_QUESTIONS && i == questionIndex) {
        elem.classList.add('is-current');
      } else if (i in questionsAnswered && questionsAnswered[i]) {
        elem.classList.add('is-answered');
      } else if (i in questionsSeen) {
        elem.classList.add('is-skipped');
      }
    });
  if (document.querySelector('.progress_bar-fill')) {
    document.querySelector('.progress_bar-fill').style.width = `${
      (100 * questionIndex) / globalParams.totalNumQuestions
    }%`;
  }
  document.querySelector('.test-top_bar').classList.remove('is-hidden');
}

function hideTopBar() {
  document.querySelector('.test-top_bar').classList.add('is-hidden');
  document.querySelector('.cognitive_test-timer').classList.add('is-hidden');
}

function handleTopBarClick(e) {
  e.preventDefault();

  if (globalParams.allowQuestionNavigation === 'true' && !isUIBlocked()) {
    let i =
      e.target.dataset['question'] ||
      e.target.parentElement.dataset['question']; // Some tests have span:s within the links
    if (i in questionsSeen || i < questionIndex) {
      console.assert(
        [STATE_QUESTIONS, STATE_VERIFY_FINISH].includes(state),
        'Top bar navigation click in invalid state %d. Was expecting it to be one of %d, %d',
        state,
        STATE_QUESTIONS,
        STATE_VERIFY_FINISH
      );
      questionIndex = i;
      state = STATE_QUESTIONS;
      return stateQuestions();
    }
  }
}
document
  .querySelectorAll('.progress_bar-discrete-fill')
  .forEach((elem) => elem.addEventListener('click', handleTopBarClick));

/* Error handler */

function handleAjaxError(jqXHR, ajaxParams, context, textStatus, errorThrown) {
  sentryMessage(
    `AjaxError in cognitive_test/take_test.js, context ${context}: ${
      errorThrown || jqXHR.statusText
    }`,
    {
      extra: {
        context: context,
        type: ajaxParams.type,
        url: ajaxParams.url,
        data: ajaxParams.data,
        status: jqXHR.status,
        textStatus: textStatus,
        error: errorThrown || jqXHR.statusText,
        response: jqXHR.responseText.substring(0, 100),
      },
    }
  );

  setState(STATE_ERROR);
  document.querySelector('.cognitive_test-error-header').textContent = context;
  document.querySelector(
    '.cognitive_test-error-message'
  ).textContent = `textStatus: ${textStatus}, errorThrown: ${errorThrown}, ajaxParams: ${JSON.stringify(
    ajaxParams
  )}`;
}

/* Pseudo-states to manage setting up and removing a warning about leaving the test early. */

function statePreventLeaving() {
  // try to prevent leaving / reloading this page while the test is going
  window.onbeforeunload = function () {
    return globalParams.preventLeavingText;
  };
  nextState();
}

function stateAllowLeaving() {
  // allow the user to leave the page now
  window.onbeforeunload = null;
  nextState();
}

/* State management */

const testStates = [
  stateInstructions,
  stateExample,
  stateAboutToStart,
  statePreventLeaving,
  stateQuestions,
  stateVerifyFinish,
  stateAllowLeaving,
  stateTestDone,
  stateTnC,
  stateError,
];
const ALREDY_STARTED_STATE = 4; // We jump to this state when a test is already started
const STATE_TNC = testStates.indexOf(stateTnC);
const TNC_NEXT = 1; // ToS sits in between instructions and example, so next leads to example
const STATE_EXAMPLE = testStates.indexOf(stateExample);
const STATE_QUESTIONS = testStates.indexOf(stateQuestions);
const STATE_VERIFY_FINISH = testStates.indexOf(stateVerifyFinish);
const STATE_ERROR = testStates.indexOf(stateError);
let state = 0;

function setState(newState) {
  sentryBreadcrumb({
    message: 'setState()',
    data: { fromState: state, toState: newState },
  });
  state = newState;
  document
    .querySelectorAll('.cognitive_test-advance')
    .forEach((button) => (button.disabled = true));
  if (!testStates[state]()) {
    document
      .querySelectorAll('.cognitive_test-advance')
      .forEach((button) => (button.disabled = false));
  }
}

function nextState() {
  if (state == STATE_TNC) {
    setState(TNC_NEXT);
  } else if (state + 1 < testStates.length) {
    setState(state + 1);
  } else {
    console.assert(false, 'Invalid state in nextState(): %d', state);
    location.reload();
  }
}

function prevState() {
  if (state == STATE_TNC) {
    setState(0);
  } else if (state > 0) {
    setState(state - 1);
  } else {
    console.assert(false, 'Invalid state in prevState(): %d', state);
    location.reload();
  }
}

function handleAdvance(e) {
  e.preventDefault();
  nextState();
}

function handleTermsLink(e) {
  e.preventDefault();
  setState(STATE_TNC);
}

document
  .querySelectorAll('.cognitive_test-advance')
  .forEach((button) => button.addEventListener('click', handleAdvance));
document
  .querySelectorAll('.cognitive_test-TnC_link')
  .forEach((button) => button.addEventListener('click', handleTermsLink));

/* Init */

function ajaxGotStateResponse(data) {
  examples = data.examples;
  sentryBreadcrumb({
    message: 'ajaxGotStateResponse()',
    data: {
      has_started: data.has_started,
      questions: data.questions,
      started_since: data.started_since,
    },
  });
  if (data.has_started) {
    testStartTime = new Date(new Date().getTime() - data.started_since * 1000);
    for (let i = 0; i < data.questions.length; ++i) {
      questionsSeen[i] = true;
      questionsAnswered[i] = data.questions[i].choice != null;
      questionsStartTime[data.questions[i].question_name] = new Date(
        new Date().getTime() - data.questions[i].time_since_started * 1000
      );
    }
    questionIndex = data.questions.length - 1;
    setState(ALREDY_STARTED_STATE);
  } else {
    setState(0);
  }
}

function initStateFromAjax() {
  var url = globalParams.stateUrl;
  var params = {
    url: url,
    success: ajaxGotStateResponse,
  };
  sentryBreadcrumb({ message: 'initStateFromAjax()' });
  ajaxRetry(params, 'initStateFromAjax', handleAjaxError);
}

if (globalParams.allowQuestionNavigation == 'true') {
  document
    .querySelectorAll('.intelligence_test-prev_button')
    .forEach((button) => button.classList.remove('is-hidden'));
  document.addEventListener('answerClicked', handleAnswerClicked);
}
if (globalParams.allowTextAnswers == 'true') {
  document
    .querySelectorAll('.intelligence_test-buttons-answers')
    .forEach((button) => button.classList.remove('is-hidden'));
}

initStateFromAjax();
