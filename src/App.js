import React from 'react';
import Axios from 'axios';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { Tabs, Tab } from '@material-ui/core';
import './App.css';
import './components/RawBulletTextArea';
import { BulletEditor, BulletOutputViewer } from './components/bullets';
import AcronymViewer from './components/AcronymViewer';
import AbbreviationTable from './components/abbreviations'
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Drawer from '@material-ui/core/Drawer';
import ViewListIcon from '@material-ui/icons/ViewList';
import Units from './units.json';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bulletInputText: "- Action section of bullet should go here; put the how/what you did in this part--bring it home w/ a great impact line\n- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2006 Unicode spaces",
      abbreviationData: [
        { value: "organizations", abbr: "orgs" },
        { value: "expandable", abbr: "expdble" },
      ],
      abbreviationTable:[
      { value: "organizations", abbr: "orgs" },
      { value: "expandable", abbr: "expdble" },
      ],
      bulletType: "OPR",
      tabValue: 0,
      drawerOpen: false,
      thesauresViewer:{
        visible: false,
        posX: 0,
        posY: 0,
        wordList: null,
      }
    };
    this.inputTextRef = React.createRef();
    this.handleTextAreaUpdate = this.handleTextAreaUpdate.bind(this);
  }

  componentDidMount() {
    const el = document.querySelector(".loader-container");
      if (el) {
        el.remove();  // removing the spinner element
        //this.setState({ loading: false }); // showing the app
      }
    let settings = this.getSettings();
    if(settings !== null)
    {
      this.setState({abbreviationData: settings.abbreviationData})
      this.setAbbreviationTable(settings.abbreviationData);
    }
  }

  componentDidUpdate() {

  }

  saveSettings = (settings) =>{
    try {
      window.localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.log(error);
    }
  }

  getSettings = () =>{
    try {
      if(window.localStorage.getItem('settings')){
        let settings = JSON.parse(window.localStorage.getItem('settings'));
        return settings;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
    return null;
  }

  onAbbreviationTableChange = (newAbbreviationData) => {
   
    const { abbreviationData } = this.state;
    
    this.setAbbreviationTable(abbreviationData);

    console.log(abbreviationData);
    let settings = {abbreviationData:abbreviationData}
    this.saveSettings(settings)
  }

  setAbbreviationTable = (abreviationData) =>{
    let newTable = abreviationData.filter((row)=>row.value !== null && row.abbr !== null);
    newTable = newTable.map((row)=>{
      row.abbr = row.abbr.trim();
      row.value = row.value.trim();
      return row;
    })
    this.setState({abbreviationTable:newTable})
  }

  handleTextAreaUpdate = (text) => {
    this.inputTextRef.current.style.height = this.inputTextRef.current.scrollHeight + "px"
    this.setState({ bulletInputText: text });
  }

  handleSelect = (e) =>{
    // let selection = window.getSelection();

    // // Get position of text selection
    // let offsetStart = this.inputTextRef.current.selectionStart;
    // let offsetEnd = this.inputTextRef.current.selectionEnd;

    // // Get potion of selection in viewport
    // let x = e.nativeEvent.clientX;
    // let y = e.nativeEvent.clientY;

    // console.log("Start: " + offsetStart + "END: " + offsetEnd + " X: " +x + " Y: " + y);
    // console.log("word: " + selection.toString())
    // if(offsetStart === offsetEnd){
    //   this.setState({thesauresViewer: {visibility: false, wordList:null}});

    //   return;
    
    // } // We dont have a full word selected

    // // Extract word from selection
    // let word = selection.toString();
    // //TODO check for multple words and reject
    // word.trim();
  }

  bulletTypeChange = (e, newValue) => {
    let bulletTypes = ["OPR", "EPR", "AWD"];
    this.setState({ tabValue: newValue, bulletType: bulletTypes[newValue] });
  }
  toggleDrawer = (event,v) =>{
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.setState({drawerOpen:v})
  }
  render() {

    const widthSettings = {
      AWD: '202.321mm',
      EPR: '202.321mm',
      OPR: '201.050mm',
    }

    const widthSetting = widthSettings[this.state.bulletType];

    let synList = null;
    if (this.state.thesauresViewer.wordList !== null) {
      synList = this.state.thesauresViewer.wordList.map(syn =>
        <li className="synonym-button" onClick={()=> this.handleSynonymSelect(syn)}>{syn}</li>
      )
    }

    return (
      <div id="root" className="root">

        <AppBar position="static" className="app-bar">
          <Toolbar>
            <Typography variant="h6" color="inherit" className="title">
              Bullet Buddy!
            </Typography>
            <Tabs
              className=""
              value={this.state.tabValue}
              onChange={this.bulletTypeChange}
              // indicatorColor="primary"
              // textColor="primary"
              >
              <Tab label="OPR" />
              <Tab label="EPR" />
              <Tab label="AWD" />
            </Tabs>
            <Button size="small" variant="outlined" color="inherit" startIcon={<ViewListIcon/>} onClick={(e)=>this.toggleDrawer(e,true)}>Abbreviations</Button>
          </Toolbar>
        </AppBar>

        <Container className="content" maxWidth="xl">
          <Grid container justify="space-around">
            <Grid item xs={12} md={12} lg={12} xl={6} spacing={1} align="center">
              <Typography variant="h6">
                Input Bullets Here
            </Typography>
              
              <textarea
                ref={this.inputTextRef}
                value={this.state.bulletInputText}
                rows={6}
                onChange={(e) => this.handleTextAreaUpdate(e.target.value)}
                className="bullet-input-text"
                style={{
                  width: widthSettings[this.state.bulletType],
                  resize: "none",
                  minHeight: "5em",
                }}
              />
              <div>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={()=>{
                  this.handleTextAreaUpdate("")
                  this.inputTextRef.current.style.height="5em"
                }}
              >Clear Input
              </Button>
              </div>

              <Typography variant="h6" component="h2">
                Smart Bullet Editor
              </Typography>
                
              <BulletEditor
                inputBullets={this.state.bulletInputText}
                updateInputText={this.handleTextAreaUpdate}
                abbreviationData={this.state.abbreviationTable} 
                width={widthSetting}
                />
                
            </Grid>

            <Grid item xs={12} md={12} lg={12} xl={6} spacing={1} align="center">
              <Typography variant="h6" component="h2">
                Bullet Output
          </Typography>
            
                <BulletOutputViewer
                  bulletsText={this.state.bulletInputText}
                  width={widthSetting}
                  updateInputText={this.handleTextAreaUpdate}
                />
              
              <AcronymViewer width={widthSetting} 
              text={this.state.bulletInputText}/>
            </Grid>
          </Grid>
          
          <Drawer className="drawer" anchor="bottom" open={this.state.drawerOpen} onClose={(e) => this.toggleDrawer(e, false)}>
          <div className="drawer-header">
            <Typography variant="h6">Current Abbreviations Table</Typography>
            <Typography variant="subtitle1">Copy your organizations approved abbreviations into the table. (They will save in your browser for future use!)</Typography>
          </div>
            <AbbreviationTable abbreviationData={this.state.abbreviationData} onAbbrevitionDataChange={this.onAbbreviationTableChange} />
          </Drawer>
          
        </Container>
               <div class="bottom-text">
            <p>This site utilizes <a href="https://material-ui.com/"> Material-UI</a>, <a href="https://handsontable.com/">HandsOnTable</a>, and the <a href="https://www.datamuse.com/api/">DataMuse API</a> The inspiration for this tool came from the <a href="https://ea-pods-team.github.io/pdf-bullets/ "> EA-Pods Team pdf-bullets project</a></p>
            <p>Submit an <a href="https://github.com/AF-Tools/bullet-buddy/issues/new/choose">issue</a> or view our <a href="https://github.com/AF-Tools/bullet-buddy/">GitHub Page</a></p>
            <p>Maintained by Nicholas Schweikart</p>
          </div> 
      </div>
    );
  }
}
export default App;
