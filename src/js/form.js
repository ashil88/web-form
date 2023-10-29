require([
    'src/js/nunjucks.min'
], (
    Nunjucks
) => {
    'use strict';

    class WebForm {
        constructor() {
            this.defaults = {
                selectors: {
                    deleteButton: '.delete-details-button',
                    detailsCardTemplate: 'script[type="text/x-nunjucks-template"]',
                    detailsWrapper: '.details-wrapper',
                    errorMessage: '.m-form-row__error-message',
                    explantoryText: '.m-form-row__explanatory',
                    inputElement: '.m-form__input'
                },
                classes: {
                    detailsWrapperHidden: 'details-wrapper--hidden',
                    errorMessageHidden: 'm-form-row__error-message--hidden',
                    errorMessageVisible: 'm-form-row__error-message--visible',
                    inputError: 'm-form__input--error'
                },
                validationTypesRegex: {
                    dob: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
                    email: /\S+@\S+\.\S+/,
                    phone: new RegExp('^\\+?(?:\\d\\s?){10,12}$')
                }
            };
    
            this.selectors = this.defaults.selectors;
            this.classes = this.defaults.classes;
            this.detailsCardTemplate = document.querySelector(this.selectors.detailsCardTemplate);
            this.detailsWrapper = document.querySelector(this.selectors.detailsWrapper);
            this.el = document.querySelector('.m-form');
            this.form = this.el.querySelector('.web-form');
            this.inputElements = this.el.querySelectorAll(this.selectors.inputElement);
            this.submitButton = this.el.querySelector('button[type="submit"]');
            this.submittedData = [];
        }
    
        init() {
            this.detailsCardTemplate = Nunjucks.compile(this.detailsCardTemplate.innerHTML);

            this.bindEvents();
        }
    
        bindEvents() {
            this.form.addEventListener('submit', this.submitForm.bind(this));
        }
    
        submitForm(e) {
            e.preventDefault();
    
            this.resetInputStates();
    
            const isValid = this.isFormValidated();
    
            this.validateAndSubmit(isValid);
        }

        resetInputStates() {
            this.inputElements.forEach((input) => {
                const element = input.querySelector('input'),
                    errorElement = input.querySelector(this.selectors.errorMessage),
                    explantoryText = input.querySelector(this.selectors.explantoryText);

                errorElement.classList.replace(this.classes.errorMessageVisible, this.classes.errorMessageHidden);

                element.removeAttribute('aria-invalid');

                if (explantoryText) {
                    element.setAttribute('aria-describedby', explantoryText.id);
                } else {
                    element.removeAttribute('aria-describedby');
                }

                this.addClassToInputElement(element, this.classes.inputError, true);
            });
        }
    
        isFormValidated() {
            const inputStates = [];

            this.inputElements.forEach((input) => {
                const element = input.querySelector('input');
    
                if (this.isElementMandatory(element) && !this.inputHasValue(element)) {
                    inputStates.push(false);
                    this.displayErrorMessage(element, input.dataset.errorMandatoryMessage);
                } else if (this.inputHasValue(element) && !this.isValidInput(element)) {
                    inputStates.push(false);
                    this.displayErrorMessage(element, input.dataset.errorInvalidMessage);
                } else {
                    inputStates.push(true);
                }
            });

            return inputStates.every(validated => validated === true);
        }
    
        isElementMandatory(element) {
            const { isMandatory } = element.closest(this.selectors.inputElement).dataset;
    
            if (isMandatory) {
                return JSON.parse(isMandatory);
            }
    
            return false;
        }
    
        inputHasValue(element) {
            return !!element.value;
        }
    
        isValidInput(element) {
            const isValidInput = this.passesFormatValidation(element);
    
            return isValidInput;
        }
    
        passesFormatValidation(element) {
            let val = element.value.trim();
    
            const elemParent = element.closest(this.selectors.inputElement),
                { formatValidationType } = elemParent.dataset;
    
            if (formatValidationType) {
                return new RegExp(this.defaults.validationTypesRegex[formatValidationType]).test(val);
            }
            
            return true;
        }
    
        displayErrorMessage(element, errorMessage) {
            const errorElement = element.closest(this.selectors.inputElement)
                                        .querySelector(this.selectors.errorMessage);
    
            element.setAttribute('aria-invalid', true);
            element.setAttribute('aria-describedby', errorElement.id);
            this.addClassToInputElement(element, this.classes.inputError);
            errorElement.classList.replace(this.classes.errorMessageHidden, this.classes.errorMessageVisible);
            errorElement.innerHTML = errorMessage;
        }
    
        addClassToInputElement(element, className, reverse) {
            const parentEl = element.closest(this.selectors.inputElement);
    
            if (reverse) {
                parentEl.classList.remove(className);
            } else {
                parentEl.classList.add(className);
            }
        }
    
        validateAndSubmit(isValid) {
            if (isValid) {
                const formData = new FormData(this.form),
                entriesObj = Object.fromEntries(formData.entries());

                this.submittedData.push(entriesObj);

                const submittedDataIndex = this.submittedData.length - 1;

                entriesObj.submittedDataIndex = submittedDataIndex;
    
                this.detailsCardTemplate.render(entriesObj, (err, html) => {
                    this.detailsWrapper.classList.remove(this.classes.detailsWrapperHidden);
                    this.detailsWrapper.insertAdjacentHTML('beforeend', html);

                    const submittedDataCard = document.querySelector(`#submittedData${submittedDataIndex}`),
                        deleteBtn = submittedDataCard.querySelector(this.selectors.deleteButton);

                    deleteBtn.addEventListener('click', () => {
                        submittedDataCard.remove();
                    });

                    location.href = `#submittedData${submittedDataIndex}`;

                    submittedDataCard.setAttribute('role', 'alert');

                    this.form.reset();
                });
            }
        }
    }
    
    const form = new WebForm();
    
    form.init();  
});
