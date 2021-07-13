/* eslint-env mocha */
/* global sinon */
import * as fixtures from './helpers/fixtures.js';
import Autocomplete from '../../main.js';
import { screen, getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import chai from 'chai';
const assert = chai.assert;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function isHidden(el) {
	return el.offsetParent === null;
}

describe("Autocomplete", function () {
	this.timeout(5000);
	it('is defined', () => {
		assert.isFunction(Autocomplete);
	});
	it("should autoinitialize", (done) => {
		const initSpy = sinon.spy(Autocomplete, 'init');
		document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
		setTimeout(function(){
			assert.isTrue(initSpy.called);
			initSpy.restore();
			done();
		}, 100);
	});

	it("should not autoinitialize when the event is not dispached", () => {
		const initSpy = sinon.spy(Autocomplete, 'init');
		assert.isFalse(initSpy.called);
	});

	context("static init method", () => {
		it('has a static init method', () => {
			assert.isFunction(Autocomplete.init);
		});

		describe("should create a new o-autocomplete", () => {

			beforeEach(() => {
				fixtures.htmlSelectCode();
			});

			afterEach(() => {
				fixtures.reset();
			});

			it("component array when initialized", () => {
				const boilerplate = Autocomplete.init();
				assert.isArray(boilerplate);
				assert.instanceOf(boilerplate[0], Autocomplete);
			});

			it("single component when initialized with a root my-autocomplete", () => {
				const boilerplate = Autocomplete.init('[data-o-component="o-autocomplete"]');
				assert.instanceOf(boilerplate, Autocomplete);
			});
		});
	});

	context('constructor', () => {
		describe('when provided with no options', () => {
			beforeEach(() => {
				fixtures.htmlSelectCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it("constructs an instance with the default options", () => {
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
				assert.instanceOf(autocomplete, Autocomplete);
				assert.deepEqual(autocomplete.autocompleteEl, document.querySelector('[data-o-component="o-autocomplete"]'));
			});
		});

		describe('only assigns options which are supported by o-autocomplete', () => {
			beforeEach(() => {
				fixtures.htmlSelectCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it('the unsupported options are not set on this.options', () => {
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'), {
					placeholder: 'Placeholder Text',
					cssNamespace: 'custom-autocomplete',
					displayMenu: 'whimsical',
					showNoOptionsFound: "sometimes",
					id: "hello"
				});
				assert.instanceOf(autocomplete, Autocomplete);

				assert.deepEqual(autocomplete.options, {});
			});
		});

		describe('when provided select element has no id attribute set', () => {
			beforeEach(() => {
				fixtures.invalidHtmlSelectCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it("throws an error", () => {
				assert.throws(() =>new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]')),
					"Missing `id` attribute on the o-autocomplete input. An `id` needs to be set as it is used within the o-autocomplete to implement the accessibility features."
				);
			});
		});

	});

	describe('enhanced select element', () => {

		describe('when no select element is provided', () => {
			beforeEach(() => {
				fixtures.invalidHtmlInputCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it("throws an error", () => {
				assert.throws(() => new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]')),
					"Could not find a source for auto-completion options. Add a `select` element to your markup, or configure a `source` function to fetch autocomplete options."
				);
			});
		});

		describe('when provided select element has no id attribute set', () => {
			beforeEach(() => {
				fixtures.invalidHtmlSelectCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it("throws an error", () => {
				assert.throws(() => new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]')),
					"Missing `id` attribute on the o-autocomplete input. An `id` needs to be set as it is used within the o-autocomplete to implement the accessibility features."
				);
			});
		});

		context('input matches a single suggestion', () => {
			beforeEach(() => {
				fixtures.htmlSelectCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it("shows a clear button when text has been input by the user", () => {
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
				assert.instanceOf(autocomplete, Autocomplete);
				const input = screen.getByRole('combobox', {
					name: /select your country/i
				});
				userEvent.type(input, 'Af');
				const clearButton = screen.getByRole('button', {
					name: /clear input/i
				});
				assert.exists(clearButton);
				// Check that the button is associated with the correct input
				assert.equal(clearButton.getAttribute('aria-controls'), 'my-autocomplete');
			});

			it("shows the suggestion box with the filtered results", async () => {
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
				assert.instanceOf(autocomplete, Autocomplete);
				const input = screen.getByRole('combobox', {
					name: /select your country/i
				});
				userEvent.type(input, 'Af');
				// The sleep is required because accessible-autocomplete renders asynchronously
				await sleep(100);
				const list = screen.getByRole('listbox');
				assert.equal(list.childElementCount, 1);
				const option = getByRole(list, 'option');
				assert.equal(option.textContent, 'Afghanistan');
			});

			context('clicking the clear button', () => {
				it("clears the input's value", async () => {
					const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
					assert.instanceOf(autocomplete, Autocomplete);
					const input = screen.getByRole('combobox', {
						name: /select your country/i
					});
					userEvent.type(input, 'Af');
					// The sleep is required because accessible-autocomplete renders asynchronously
					await sleep(100);
					assert.equal(input.value, 'Af');
					const clearButton = screen.getByRole('button', {
						name: /clear input/i
					});
					userEvent.click(clearButton);
					assert.equal(input.value, '');
				});
			});

			context('tabbing to the clear button and pressing enter', () => {
				it("clears the input's value", async () => {
					const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
					assert.instanceOf(autocomplete, Autocomplete);
					const input = screen.getByRole('combobox', {
						name: /select your country/i
					});
					userEvent.type(input, 'Af');
					// The sleep is required because accessible-autocomplete renders asynchronously
					await sleep(100);
					assert.equal(input.value, 'Af');
					userEvent.tab();
					await sleep(100);
					const clearButton = screen.getByRole('button', {
						name: /clear input/i
					});
					const activeElement = document.activeElement;
					// The suggestion should now be the active element - the one with focus
					assert.equal(clearButton, activeElement);
					userEvent.type(clearButton, "{enter}");
					assert.equal(input.value, '');
				});
			});

			context('pressing Escape key after typing into the input', () => {
				it("hides the suggestion box", async () => {
					const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
					assert.instanceOf(autocomplete, Autocomplete);
					const input = screen.getByRole('combobox', {
						name: /select your country/i
					});
					userEvent.type(input, 'Af');
					// The sleeps are required because accessible-autocomplete renders asynchronously
					await sleep(100);
					const list = screen.getByRole('listbox');
					assert.isFalse(isHidden(list));
					userEvent.type(input, '{esc}');
					await sleep(100);
					assert.isTrue(isHidden(list));
				});
			});

			context('clicking a suggestion', () => {
				it("updates the input with the selected suggestion", async () => {
					const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
					assert.instanceOf(autocomplete, Autocomplete);
					const input = screen.getByRole('combobox', {
						name: /select your country/i
					});
					userEvent.type(input, 'Af');
					// The sleep is required because accessible-autocomplete renders asynchronously
					await sleep(100);
					const list = screen.getByRole('listbox');
					assert.equal(list.childElementCount, 1);
					const option = getByRole(list, 'option');
					userEvent.click(option);
					assert.equal(input.value, 'Afghanistan');
				});
			});
			context('keyboard navigating to a suggestion and pressing enter on it', () => {
				it("updates the input with the selected suggestion", async () => {
					const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
					assert.instanceOf(autocomplete, Autocomplete);
					const input = screen.getByRole('combobox', {
						name: /select your country/i
					});
					userEvent.type(input, 'Af');
					// The sleeps are required because accessible-autocomplete renders asynchronously
					await sleep(100);
					userEvent.type(input, '{arrowdown}');
					await sleep(100);
					const activeElement = document.activeElement;
					const list = screen.getByRole('listbox');
					const option = getByRole(list, 'option');
					// The suggestion should now be the active element - the one with focus
					assert.equal(option, activeElement);
					// Pressing enter whilst a suggestion is in focus should update the input's value with the suggestion
					userEvent.type(activeElement, '{enter}');
					await sleep(100);
					assert.equal(input.value, 'Afghanistan');
				});
			});
			context('keyboard navigating to a suggestion and pressing tab on it', () => {
				it("updates the input with the selected suggestion and focus the clear button", async () => {
					const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'));
					assert.instanceOf(autocomplete, Autocomplete);
					const input = screen.getByRole('combobox', {
						name: /select your country/i
					});
					userEvent.type(input, 'Af');
					// The sleeps are required because accessible-autocomplete renders asynchronously
					await sleep(100);
					userEvent.type(input, '{arrowdown}');
					await sleep(100);
					// The suggestion should now be the active element - the one with focus
					userEvent.tab();
					// Pressing tab whilst a suggestion is in focus should update the input's value with the suggestion
					// and then focus the suggestion
					await sleep(100);
					assert.equal(input.value, 'Afghanistan');
					const activeElement = document.activeElement;
					const clearButton = screen.getByRole('button', {
						name: /clear input/i
					});
					assert.equal(clearButton, activeElement);
				});
			});
		});
	});

	describe('dynamic suggestions', () => {
		beforeEach(() => {
			fixtures.htmlInputCode();
		});

		afterEach(() => {
			fixtures.reset();
		});

		describe('only assigns options which are supported by o-autocomplete', () => {
			beforeEach(() => {
				fixtures.htmlInputCode();
			});

			afterEach(() => {
				fixtures.reset();
			});
			it('the unsupported options are not set on this.options', () => {
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'), {
					placeholder: 'Placeholder Text',
					cssNamespace: 'custom-autocomplete',
					displayMenu: 'whimsical',
					showNoOptionsFound: "sometimes",
					id: "hello",
					source: function customSuggestions(query, populateResults) {
						const suggestions = [
							'Origami',
						];

						if (!query) {
							populateResults([]);
							return;
						}

						const filteredResults = [];
						for (const suggestion of suggestions) {
							const lowercaseSuggestion = suggestion.toLocaleLowerCase();
							if (lowercaseSuggestion.startsWith(query.toLocaleLowerCase())) {
								filteredResults.push(suggestion);
							}
						}
						populateResults(filteredResults);
					}
				});
				assert.instanceOf(autocomplete, Autocomplete);

				assert.deepEqual(Object.keys(autocomplete.options), ['source']);
				assert.isFunction(autocomplete.options.source,);
			});
		});

		context('synchronous source function', () => {
			it("shows the suggestion box with the filtered results", async () => {
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'), {
					source: function customSuggestions(query, populateResults) {
						const suggestions = [
							'Origami',
						];

						if (!query) {
							populateResults([]);
							return;
						}

						const filteredResults = [];
						for (const suggestion of suggestions) {
							const lowercaseSuggestion = suggestion.toLocaleLowerCase();
							if (lowercaseSuggestion.startsWith(query.toLocaleLowerCase())) {
								filteredResults.push(suggestion);
							}
						}
						populateResults(filteredResults);
					}
				});
				assert.instanceOf(autocomplete, Autocomplete);
				const input = screen.getByRole('combobox', {
					name: /select your team/i
				});
				userEvent.type(input, 'o');
				// The sleep is required because accessible-autocomplete renders asynchronously
				await sleep(100);
				const list = screen.getByRole('listbox');
				assert.equal(list.childElementCount, 1);
				const option = getByRole(list, 'option');
				assert.equal(option.textContent, 'Origami');
			});
		});

		context('asynchronous source function', () => {
			it("shows the suggestion box with the filtered results", async () => {
				let suggestionTimeoutId;
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'), {
					source: function customSuggestions(query, populateResults) {
						clearTimeout(suggestionTimeoutId);
						const suggestions = [
							'Origami',
						];

						if (!query) {
							populateResults([]);
							return;
						}

						suggestionTimeoutId = setTimeout(() => {
							const filteredResults = [];
							for (const suggestion of suggestions) {
								const lowercaseSuggestion = suggestion.toLocaleLowerCase();
								if (lowercaseSuggestion.startsWith(query.toLocaleLowerCase())) {
									filteredResults.push(suggestion);
								}
							}
							populateResults(filteredResults);
						}, 1000);
					}
				});
				assert.instanceOf(autocomplete, Autocomplete);
				const input = screen.getByRole('combobox', {
					name: /select your team/i
				});
				userEvent.type(input, 'o');
				// The sleep is required because the suggestions are being returned asynchronously as part of the test
				await sleep(1100);
				const list = screen.getByRole('listbox');
				assert.equal(list.childElementCount, 1);
				const option = getByRole(list, 'option');
				assert.equal(option.textContent, 'Origami');
			});
		});

		context('custom source and mapOptionToSuggestedValue functions defined', () => {
			it("applies the mapOptionToSuggestedValue function on each suggestion supplied by the source function", async () => {
				const source = sinon.spy(function customSuggestions(query, populateResults) {
					const suggestions = [
						{team: 'Infrastructure Delivery'},
						{team: 'Infrastructure & Data Hosting'},
						{team: 'API Gateway'},
						{team: 'Cloud Enablement'},
						{team: 'Cyber Security Engineering'},
						{team: 'Foundation Services'},
						{team: 'Infrastructure Management'},
						{team: 'Microsites Team'},
						{team: 'Operations Support'},
						{team: 'Origami team'},
						{team: 'Reliability Engineering'}
					];

					if (!query) {
						populateResults([]);
						return;
					}

					const filteredResults = [];
					for (const suggestion of suggestions) {
						const lowercaseSuggestion = suggestion.team.toLocaleLowerCase();
						if (lowercaseSuggestion.startsWith(query.toLocaleLowerCase())) {
							filteredResults.push(suggestion);
						}
					}
					populateResults(filteredResults);
				});
				const mapOptionToSuggestedValue = sinon.spy(option => {
					if (option) {
						return option.team;
					}
				});
				const autocomplete = new Autocomplete(document.querySelector('[data-o-component="o-autocomplete"]'), {
					source,
					mapOptionToSuggestedValue
				});
				assert.instanceOf(autocomplete, Autocomplete);
				const input = screen.getByRole('combobox', {
					name: /select your team/i
				});
				userEvent.type(input, 'o');
				// The sleep is required because the suggestions are being returned asynchronously as part of the test
				await sleep(1100);
				assert.isTrue(mapOptionToSuggestedValue.calledWith({team: "Operations Support"}));
				assert.isTrue(mapOptionToSuggestedValue.calledWith({team: "Origami team"}));
				const list = screen.getByRole('listbox');
				assert.equal(list.childElementCount, 2);
				const option = list.firstElementChild;
				userEvent.click(option);
				await sleep(1100);
				assert.equal(input.value, 'Operations Support');
			});
		});
	});
});
