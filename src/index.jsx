import React from 'react';
import 'whatwg-fetch';

var Options = React.createClass({

  propTypes: {
    items: React.PropTypes.array,
    isOpen: React.PropTypes.bool
  },

  keyDownMap: {
    38: 'focusPrevious',
    40: 'focusNext'
  },

  handleKeyDown(e) {
    let handlerName = this.keyDownMap[e.keyCode];
    if (!handlerName) return;
    this[handlerName].call(this, e);
    e.preventDefault();
  },

  focusNext(e) {
    if (e.target.nextSibling) e.target.nextSibling.focus();
  },

  focusPrevious(e) {
    if (e.target.previousSibling) e.target.previousSibling.focus();
  },

  render() {
    let options = this.props.items.map((el) => {
      return (
        <div tabIndex="0">{el.value}</div>
      );
    });
    return (
      <div
        className={'react-select__options ' + (this.props.isOpen ? '' : '_hide')}
        onKeyDown={this.handleKeyDown}>
        {options}
      </div>
    );
  }

});

export default React.createClass({

  getInitialState() {
    return {
      items: [],
      currentItem: '',
      isOpen: false
    };
  },

  getDefaultProps() {
    return {
      minLength: 3,
      rootUrl: ''
    };
  },

  propTypes: {
    label: React.PropTypes.string,
    rootUrl: React.PropTypes.string,
    minLength: React.PropTypes.number
  },

  componentWillMount() {
    document.addEventListener('click', this.closeOptionsIfClickedOutside);
  },
  
  componentWillUnmount() {
    document.removeEventListener('click', this.closeOptionsIfClickedOutside);
  },
  closeOptionsIfClickedOutside(e) {
    if (!this.state.isOpen) return;
    let input = this.refs.input.getDOMNode();
    let options = this.refs.options.getDOMNode();
    let eventOccuredOutsideInput = this.clickedOutsideElement(input, e);
    let eventOccuredOutsideOptions = this.clickedOutsideElement(options, e);
    if (eventOccuredOutsideInput && eventOccuredOutsideOptions) this.setState({isOpen: false});
  },

  clickedOutsideElement(element, e) {
    let eventTarget = e.target;
    while (eventTarget != null) {
      if (eventTarget === element) return false;
      eventTarget = eventTarget.offsetParent;
    }
    return true;
  },

  keyDownMap: {
    27: 'hideOnEscape',
    13: 'selectOnEnter',
    38: 'focusPrevious',
    40: 'focusNext'
  },

  handleKeyDown(e) {
    let handlerName = this.keyDownMap[e.keyCode];
    if (!handlerName) return this.refs.input.getDOMNode().focus();
    this[handlerName].call(this, e);
    e.preventDefault();
  },

  hideOnEscape() {
    this.refs.input.getDOMNode().focus();
    this.hideOptions();
  },

  selectOnEnter(e) {
    if (this.clickedOutsideElement(this.refs.input.getDOMNode(), e)) {
      this.setState({currentItem: e.target.innerText});
    } else if (this.state.isOpen) {
      this.setState({currentItem: this.refs.options.getDOMNode().childNodes[0].innerText});
    }
    this.hideOptions();
    e.preventDefault();
  },

  focusPrevious(e) {
    if (!e.target.previousSibling) {
      this.refs.input.getDOMNode().focus();
    }
  },

  focusNext(e) {
    if (!this.clickedOutsideElement(this.refs.input.getDOMNode(), e)) {
      this.refs.options.getDOMNode().childNodes[0].focus();
    }
  },

  click(e) {
    if (this.clickedOutsideElement(this.refs.input.getDOMNode(), e)) {
      this.setState({currentItem: e.target.innerText});
      this.hideOptions();
    }
  },

  changeInput(e) {
    this.setState({currentItem: e.target.value});
    if (e.target.value.trim().length >= this.props.minLength) {
      fetch(this.props.rootUrl + e.target.value)
        .then((response) => response.json())
        .then((data) => {
          this.setState({items: data});
          this.showOptions();
        });
    } else {
      this.hideOptions();
    }
  },

  hideOptions() {
    this.setState({isOpen: false});
  },

  showOptions() {
    this.setState({isOpen: true});
  },

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <div
          onKeyDown={this.handleKeyDown}
          onClick={this.click}
          className={'react-select ' + (this.state.isOpen ? '_up' : '')}>
          <input
            className='react-select__input'
            ref="input"
            type="text"
            value={this.state.currentItem}
            onChange={this.changeInput}
            onFocus={this.changeInput}/>
          <Options
            isOpen={this.state.isOpen}
            ref="options"
            items={this.state.items}/>
        </div>
      </div>
    );
  }

});

