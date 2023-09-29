import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Answers {
    constructor() {
        this.allAnswers = null;
        this.userAnswers = [];
        this.testInfo = null;

        this.routeParams = UrlManager.getQueryParams();
        console.log(this.routeParams)

        this.init();
        let that = this;

        document.getElementById('back-to-results').onclick = function () {
            location.href = '#/result?id=' + that.routeParams.id;
        }
    }

    async init() {
        const userInfo = Auth.getUserInfo();

        document.getElementById('user-full-name').innerText = userInfo.fullName;
        document.getElementById('user-email').innerText = userInfo.email;

        if (!userInfo) {
            location.href = '#/';
        }

        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.testInfo = result;
                }
            } catch (error) {
                return console.log(error);
            }
            try {
                const testResults = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + userInfo.userId);

                if (testResults.error) {
                    throw new Error(testResults.error);
                }
                this.userAnswers = testResults.chosen_options;
            } catch (error) {
                return console.log(error);
            }
            this.showAnswers();
        }
    }

    showAnswers() {
        const questions = this.testInfo.test.questions;
        const answers = document.getElementById('answers-questions');

        for (let i = 0; i < questions.length; i++) {
            let questionIndex = i + 1;
            let question = questions[i];
            this.allAnswers = question.answers;

            let questionsBlock = document.createElement('div');
            questionsBlock.classList = 'questions';

            let questionOption = null;

            for (let j = 0; j < this.allAnswers.length; j++) {
                questionOption = document.createElement('div');
                questionOption.classList = 'test-questions-option';

                let questionInput = document.createElement('input');
                questionInput.setAttribute('type', 'radio');
                questionInput.setAttribute('id', this.allAnswers[j].id);
                questionInput.setAttribute('name', questionIndex);
                questionInput.setAttribute('disabled', 'disabled');

                let questionLabel = document.createElement('label');
                questionLabel.innerText = this.allAnswers[j].answer;
                questionLabel.setAttribute('for', this.allAnswers[j].id);

                for (let k = 0; k < this.userAnswers.length; k++) {
                    this.userAnswers[k] = parseInt(this.userAnswers[k]);
                    if (this.allAnswers[j].id === this.userAnswers[k]) {
                        questionInput.setAttribute('checked', 'checked');
                        if (this.allAnswers[j].correct) {
                            questionLabel.classList = '_correct';
                            questionInput.classList = '_correct';
                        } else {
                            questionLabel.classList = '_error';
                            questionInput.classList = '_error';
                        }
                    }
                }

                questionOption.appendChild(questionInput);
                questionOption.appendChild(questionLabel);
                questionsBlock.appendChild(questionOption);
            }

            let answer = document.createElement('div');
            answer.classList = 'test-questions-options';
            answer.setAttribute('id', 'answer');

            let answerTitle = document.createElement('div');
            answerTitle.innerHTML = '<span>Вопрос ' + questionIndex + ': </span>' + question.question;
            answerTitle.classList = 'answers-question-title';
            answerTitle.setAttribute('id', 'answer-title');

            answer.appendChild(answerTitle);
            answer.appendChild(questionsBlock);
            answers.appendChild(answer);
        }
    }
}
