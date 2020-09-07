import React from 'react';
class InputBulletTextArea extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
      };
    }
  
    componentDidMount() {
      
    }
  
    textAreaUpdate = (evnt) =>{
      this.setState({text: evnt.target.value});
    }
    render() {
        const widthSettings = {
            AWD:'202.321mm',
            EPR:'202.321mm',
            OPR :'201.041mm',
        }

      return (
        <textarea 
          rows={5} 
          value={this.state.text} 
          onChange={this.textAreaUpdate}
          className="bullet-text"
          style={{
              width: widthSettings[this.props.bulletType],
              resize:"none",
            }}
          />
      );
    }
  }
  
  export default InputBulletTextArea;