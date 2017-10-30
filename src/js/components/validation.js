import emitter from '../utils/emitter'
import registerEvents from '../utils/register-events'

import rules from './validation/defaults'

const NAME = 'validation'
const DEFAULTS = {
  events: 'blur',
  selector: '[data-required]'
}

class Validation {
  constructor (element, options) {
    this.element = element

    this.options = { ...DEFAULTS, ...options }
  }

  init () {
    this.fields = this.element.querySelectorAll(this.options.selector)
    this.events = this.options.events.replace(/\s/g, '').split(',')

    this.bindListeners()
    this.registerComponent()

    return this
  }

  bindListeners () {
    this.handler = (e) => {
      this.validate(e.target)
    }

    registerEvents(this.fields, this.events, this.handler)
  }

  setPristine (field) {
    emitter.emit('validation:pristine', field)
  }

  validate (field) {
    let rules = field.getAttribute('data-validate')

    if (!rules) {
      return
    }

    rules = rules.split(' ').reduce((errors, rule) => {
      if (!this.rules[rule].call(this, field, this.element)) {
        errors.push(rule)
      }

      return errors
    }, [])

    emitter.emit(`validation:${!rules.length ? 'success' : 'error'}`, field, rules)

    return !rules.length
  }

  validateAll () {
    return Array.prototype.map.call(
      this.getFilteredInputs(), this.validate, this
    ).every(validation => validation)
  }

  getFilteredInputs () {
    return Array.prototype.filter.call(
      this.element.querySelectorAll(this.options.selector), this.getValidInputs
    )
  }

  getValidInputs (input) {
    return input.hasAttribute('data-validate')
  }

  registerComponent () {
    this.element.attributes.component = new Validation(this, this.options)
  }
}

Validation.prototype.rules = rules

export default Validation
