import React, {Component, PropTypes} from 'react'

import {simulateFact, FactPT} from 'gEngine/facts'
import {addStats} from 'gEngine/simulation'

import {isData, formatData} from 'lib/guesstimator/formatter/formatters/Data'

const readableIdPartFromWord = word => (/\d/).test(word) ? word : word[0]
function getVariableNameFromName(rawName) {
  const name = rawName.trim().replace(/[^\w\d]/g, ' ').toLowerCase().replace(/\s/g, '_')
  const words = name.split(/[^\w\d]/).filter(s => !_.isEmpty(s))
  if (words.length === 1 && name.length < 30) {
    return name
  } else if (words.length < 8) {
    return name.slice(0,8)
  } else {
    return words.map(readableIdPartFromWord).join('')
  }
}

export class FactForm extends Component {
  static defaultProps = {
    startingFact: {
      name: '',
      expression: '',
      variable_name: '',
      simulation: {
        sample: {
          values: [],
          errors: [],
        },
      },
    }
  }

  static propTypes = {
    existingVariableNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    startingFact: FactPT,
  }

  state = {
    variableNameManuallySet: !_.isEmpty(_.get(this.props, 'startingFact.variable_name')),
    runningFact: this.props.startingFact,
  }

  setFactState(newFactState, otherState = {}) { this.setState({...otherState, runningFact: {...this.state.runningFact, ...newFactState}}) }
  onChangeName(e) {
    const name = _.get(e, 'target.value')
    this.setFactState(this.state.variableNameManuallySet ? {name} : {name, variable_name: getVariableNameFromName(name)})
  }
  onChangeVariableName(e) { this.setFactState({variable_name: _.get(e, 'target.value')}, {variableNameManuallySet: true}) }
  onChangeExpression(e) { this.setFactState({expression: _.get(e, 'target.value')}) }
  onBlurExpression() {
    const {runningFact} = this.state
    if (isData(runningFact.expression)) {
      let simulation = {sample: {values: formatData(runningFact.expression)}}
      addStats(simulation)
      this.setFactState({simulation})
    } else {
      simulateFact(this.state.runningFact).then(({values, errors}) => {
        let simulation = {sample: {values, errors}}
        addStats(simulation)
        this.setFactState({simulation})
      })
    }
  }

  isExpressionValid() { return _.isEmpty(_.get(this, 'state.runningFact.simulation.sample.errors')) }
  isVariableNameUnique() { return !_.some(this.props.existingVariableNames, n => n === this.state.runningFact.variable_name) }
  isValid() {
    const requiredProperties = [
      'variable_name',
      'expression',
      'simulation.sample.values',
      'simulation.stats',
    ]
    const requiredPropertiesPresent = requiredProperties.map(prop => !_.isEmpty(_.get(this.state.runningFact, prop)))
    return _.every(requiredPropertiesPresent) && this.isExpressionValid() && this.isVariableNameUnique()
  }
  onSubmit() { this.props.onSubmit(this.state.runningFact) }

  submitIfEnter(e){
    if (e.keyCode === 13 && this.isValid()) {this.onSubmit()}
  }

  render() {
    const buttonClasses = ['ui', 'button', 'small', 'primary', ...(this.isValid() ? [] : ['disabled'])]
    const {props: {buttonText, onCancel, onDelete}, state: {runningFact: {expression, name, variable_name}}} = this

    return (
    <div className='Fact--outer'>
      <div className='Fact new ui form'>
        <div className='section-simulation simulation-sample'>
          <div className={`field ${this.isExpressionValid() ? '' : 'error'}`}>
            <input
              type='text'
              placeholder='value'
              value={expression}
              onChange={this.onChangeExpression.bind(this)}
              onBlur={this.onBlurExpression.bind(this)}
            />
          </div>
        </div>
        <div className='section-name'>
          <div className='fact-name'>
            <div className={`field ${this.isVariableNameUnique() ? '' : 'error'}`}>
              <textarea
                type='text'
                rows='1'
                placeholder='name'
                value={name}
                onChange={this.onChangeName.bind(this)}
                onKeyDown={this.submitIfEnter.bind(this)}
              />
            </div>
          </div>
          <div className='variable-name'>
            <div className='field'>
              <span className='prefix'>#</span>
              <input
                type='text'
                placeholder='hashtag'
                value={variable_name}
                onChange={this.onChangeVariableName.bind(this)}
                onKeyDown={this.submitIfEnter.bind(this)}
              />
            </div>
          </div>
          <div className='actions'>
            <span className={buttonClasses.join(' ')} onClick={this.onSubmit.bind(this)}>{buttonText}</span>
            {!!onCancel && <span className='ui button small' onClick={onCancel}>Cancel</span>}
            {!!onDelete && <span className='ui button small' onClick={onDelete}>Delete</span>}
          </div>
        </div>
      </div>
    </div>
    )
  }
}
