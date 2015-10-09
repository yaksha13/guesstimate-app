import React, {Component, PropTypes} from 'react'
import _ from 'lodash'
import * as spaceActions from 'gModules/spaces/actions.js'
import { connect } from 'react-redux';
import {connectReduxForm} from 'redux-form';
import {Input, ButtonToolbar} from 'react-bootstrap/lib'

function validateContact(data) {
  const errors = {};
  if(!data.name) {
    errors.name = 'Required';
  }
  return errors;
}

class NewSpaceForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired
  }

  render() {
    const { fields: {name, address, phone}, handleSubmit, submitting } = this.props;
    return (
      <div className='container' >
        <form onSubmit={handleSubmit} className='ui form'>
          <label>Name</label>
          <Input type="text" {...name}/>
          {name.error && name.touched && <div>{name.error}</div>}

        <ButtonToolbar>
          <button type='submit' className='ui button primary' onClick={handleSubmit} disabled={submitting}>
            {!submitting ? 'Create' : 'Submitting'}
          </button>
        </ButtonToolbar>
        </form>
      </div>
    );
  }
}

NewSpaceForm = connectReduxForm({
  form: 'newSpace',
  fields: ['name'],
  validate: validateContact,
})(NewSpaceForm);

@connect()
export default class NewSpaceFormContainer extends Component{
  onSubmit(e) {
    this.props.dispatch(spaceActions.create(e))
  }
  render() {
    return ( <NewSpaceForm onSubmit={this.onSubmit.bind(this)}/>  )
  }
}
