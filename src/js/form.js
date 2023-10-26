class WebForm {
    constructor() {
        this.defaults = {
            selectors: {
                errorMessage: '.m-form-row__error-message',
                inputElement: '.m-form__input'
            },
            classes: {
                errorMessageHidden: 'm-form-row__error-message--hidden',
                errorMessageVisible: 'm-form-row__error-message--visible',
                inputError: 'm-form__input--error'
            },
            validationTypesRegex: {
                email: /\S+@\S+\.\S+/
            }
        };

        this.selectors = this.defaults.selectors;
        this.classes = this.defaults.classes;
        this.el = document.querySelector('.m-form');
        this.inputElements = this.el.querySelectorAll(this.selectors.inputElement);
        this.submitButton = this.el.querySelector('button[type="submit"]');
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.submitButton.addEventListener('click', this.submitForm.bind(this));
    }

    submitForm(e) {
        e.preventDefault();

        // TODO: reset form inputs

        const isValid = this.isFormValidated();

        this.validateAndSubmit(isValid);
    }

    isFormValidated() {
        this.inputElements.forEach((input) => {
            const inputStates = [],
                element = input.querySelector('input');

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

    addClassToInputElement(element, className) {
        const parentEl = element.closest(this.selectors.inputElement);

        parentEl.classList.add(className);
    }

    validateAndSubmit() {}
}

const form = new WebForm();

form.init();