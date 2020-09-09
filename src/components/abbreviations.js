import React from 'react';
import { HotTable } from '@handsontable/react';

const tableSettings = {
    columns: [{
        data: 'value',
        type: 'text'
        },{
        data: 'abbr',
        type: 'text'
        },
    ],
    stretchH: 'all',
    width: 500,
    autoWrapRow: true,
    height: 500,
    maxRows: Infinity,
    manualRowResize: true,
    manualColumnResize: true,
    rowHeaders: false,
    colHeaders: [
        'Word',
        'Abbreviation',
    ],
    trimWhitespace: false,
    enterBeginsEditing:false,
    manualRowMove: true,
    manualColumnMove: true,
    columnSorting: {
        indicator: true
    },
    autoColumnSize: false,
    minRows: 2,
    minSpareRows:1,
    contextMenu: true,
    licenseKey: 'non-commercial-and-evaluation',
    search: {
        queryMethod: function(queryStr,value){
            return queryStr.toString() === value.toString();
        },
        callback: function(instance, row, col, value, result){
            const DEFAULT_CALLBACK = function(instance, row, col, data, testResult) {
                instance.getCellMeta(row, col).isSearchResult = testResult;
            };
  
            DEFAULT_CALLBACK.apply(this, arguments);
        },
    },
  };

class AbbreviationTable extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        
      };
      
    }
  
    handleChange = e => {
          // Call parent to update state need to do value and abbr seperatly! They each come back as there own event.
        
          if(e === null){return;} 
          this.props.onAbbrevitionDataChange(e);
          
    }
  
    render(){
    const {abbreviationData} = this.props;
    return(
          
        <HotTable className={"abbreviation-table"} settings={tableSettings}  data={abbreviationData} afterChange={this.handleChange}/>
      );
    }
  }
  
  export default AbbreviationTable;