import React from 'react';
import Button from '@material-ui/core/Button';
import Axios from 'axios';


import Icon from '@material-ui/core/Icon';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { render } from '@testing-library/react';
class Word extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      synonyms: null,
      isEditable: null,
    };

    this.handlePopoverClose = this.handlePopoverClose.bind(this);
    this.handlePopoverOpen = this.handlePopoverOpen.bind(this);
  }

  handlePopoverOpen = (event) => {
    this.setState({ open: true })
  };

  handlePopoverClose = () => {
    this.setState({ open: false })
  }

  handleHover = (event) =>{

    // Change CSS

    // Load synonyms and populate lists

  }

  isNotEditable = word => {
    return word.match(/([A-Z]{2,})/) != null
      | word.match(/([0-9])/) != null
      | word.length <= 2
      | (this.props.index < 1);
  }

  getAbbreviations = word => {
    if(this.props.abbreviationData === null){return null}
    // extract dictionary
    const abbreviation = this.props.abbreviationData.find((row) => row.abbr === word.toLowerCase() | row.value.toLowerCase() === word.toLowerCase());

    return typeof abbreviation === "undefined" ? null : abbreviation;
  }

  getSynonyms = (word) => {

    ////console.log("Attempting to get synonyms for: " + word)
    Axios.get("https://api.datamuse.com/words?max=15&ml=" + word)
      .then(res => {
        if (res.status === 200) {
          const data = res.data;
          if (data.length !== 0) {

            const all = data.map((item) => {
              return item.word
            });
            ////console.log(all)
            this.setState({ synonyms: all })
          }
        } else {
          //console.log(`Failed to fetch synonyms: ${res}`);
        }
      })
      .catch(err => {
        //console.log(`ERR: ${JSON.toString(err)}`);
      });

  }

  componentDidMount() {

    if (this.isNotEditable(this.props.value)) {
      this.setState({ isEditable: false })
    } else {
      this.getSynonyms(this.props.value);
      this.setState({ isEditable: true })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value && this.state.isEditable) {
      this.getSynonyms(this.props.value);
    }
  }

  render() {
    let word = this.props.value;

    let c = "bullet-editor-word-editable";

    // Check if abbreviable
    const abbrvData = this.getAbbreviations(word);

    if (abbrvData !== null) {

      if (abbrvData.value.toLowerCase() === word.toLowerCase()) { // Abbreviable word
        
        c = c + " abbreviable popup"
        
        return (
          <span
            className={c}
            key={"popup" + this.props.key}
            onMouseEnter={this.handlePopoverOpen}
            onMouseLeave={this.handlePopoverClose}
          >
            {word}
            <span className={this.state.open ? "popuptext show" : "popuptext"} >
              <ul className="popuptextlist">
                <li
                  className="synonym-button"
                  onClick={() => this.props.changeWord(abbrvData.abbr, this.props.parentIndex)}
                >{abbrvData.abbr}
                </li>
              </ul>
            </span>
          </span>
        );
      }

      if (abbrvData.abbr === word) {
        // Already abbreviated word
        c = c + " approved-abbreviation popup"
        return (
          <span
            className={c}
            onMouseEnter={this.handlePopoverOpen}
            onMouseLeave={this.handlePopoverClose}

          >
            {word}
            <span className={this.state.open ? "popuptext show" : "popuptext"} >
              <ul className="popuptextlist">
                <li
                  className="synonym-button"
                  onClick={() => this.props.changeWord(abbrvData.value.toLowerCase(), this.props.parentIndex)}
                >{abbrvData.value}
                </li>
              </ul>
            </span>
          </span>
        );
      }
    }

    if (this.isNotEditable(word)) {
      c = "bullet-editor-word popup";
      return (<span key={"word" + this.props.key} className={c}>{word}</span>);
    }

    c = c + " popup";

    let synList = null;
    if (this.state.synonyms !== null) {
      synList = this.state.synonyms.map(syn =>
        <li
          className="synonym-button"
          key = {syn + this.props.parentIndex.toString()}
          onClick={() => this.props.changeWord(syn, this.props.parentIndex)}
        >{syn}</li>
      )
    }

    return (

      <span
        className={c}
        key={"word"+this.props.key}
        onMouseEnter={this.handlePopoverOpen}
        onMouseLeave={this.handlePopoverClose}

      >
        {word}
        <span key={"popup"+ this.props.key} className={this.state.open ? "popuptext show" : "popuptext"} >
          <ul className="popuptextlist">{synList}</ul>
        </span>
      </span>
    );

  }
}

class Bullet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indexOfColon: null,
      indexOfDashes: null,
    };
    this.changeWord = this.changeWord.bind(this);
  }

  componentDidMount() {
    //this.setState({ bullet: this.updateBullet(this.props.text) })
  }

  componentDidUpdate(prevProps) {
    // if (this.props.text !== prevProps.text) {
    //   this.setState({ bullet: this.updateBullet(this.props.text) })
    // }
  }

  tokenize = (text) => {
    let output = [];


    // if (text.match(';') !== null && text.match(/-{2}/) !== null) {
    //   // First extract A;I--R
    //   let [action, impact, result] = text.split(/;|-{2}/);
    //   ////console.log(`action: ${action} impact: ${impact} result: ${result}`)

    //   // Then split each up by spaces
    //   action = action.split(/[\s]/);
    //   impact = impact.split(/[\s]/);
    //   result = result.split(/[\s]/);

    //   // Recombine w/ spaces in right spots.
    //   output = [...action, ";", ...impact, "--", ...result];
    // } else {
    //   // We have some strange input so split on any end punctuations
    //   output = text.split(/\s/);
    // }

    text.split(/\s/).map(seg=>{
      let innerSeg = seg.split(/([/;,-])/);
      if (innerSeg.length === 1){
        output.push(seg);
        output.push(' ');
      }else{
        innerSeg.map(s=>{
          if(s !== '') output.push(s);
        })
        output.push(' ');
      }
    })
    return output;
  }

  tweak = (sentence) => {
    // adds a 0-width space (\u200B) after forward slashes to cause them to wrap
    sentence = sentence.replace(/(\w)\//g, '$1/\u200B');

    // adds a non-breaking dash (\u2011) instead of a dash to prevent wrapping
    sentence = sentence.replace(/-/g, '\u2011');
    return sentence;
  }

  changeWord = (newWord, i) => {
    let newBullet = this.tokenize(this.props.text);
    newBullet[i] = newWord;
    this.props.updateBulletText(newBullet.join(''), this.props.parentIndex);
    //console.log("bullet change:" + newBullet.join(' '))
  }

  render() {
    const { text } = this.props;
    let bullet = this.tokenize(text);
    return (

      bullet.map((word, i) => {
        return (
          <Word value={word} parentIndex={i} changeWord={this.changeWord} abbreviationData={this.props.abbreviationData} />
        );
      })
    );
  }
}

class BulletEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bullets: [],

    };
    this.ref = React.createRef();
    this.updateBulletText = this.updateBulletText.bind(this);
  }

  componentDidMount() {
    this.setState({ bullets: this.extractBullets(this.props.inputBullets) })
  }

  componentDidUpdate(prevProps) {
    if (this.props.inputBullets !== prevProps.inputBullets) {
      this.setState({ bullets: this.extractBullets(this.props.inputBullets) })
    }
  }

  extractBullets = text => {
    let bullets = text.split(/-\s{1}/);
    bullets.shift();
    bullets = bullets.map((bullet) => {
      return bullet = "- " + bullet.trim();
    });
    return bullets;
  }

  updateBulletText = (newText, i) => {
    let bullets = this.state.bullets;
    bullets[i] = newText;
    bullets.join(' ');
    bullets[i] = bullets[i].replace(/\s;\s/, ";");
    bullets[i] = bullets[i].replace(/\s-{2}\s/, "--");
    bullets[i] = "- " + bullets[i].charAt(2).toUpperCase() + bullets[i].slice(3);
    //console.log("bullet round 2: " + bullets[i])
    this.props.updateInputText(bullets.join('\n'));
  }

  onChange = (e, i) => {

    let c = e.nativeEvent.target.childNodes;
    c = Array.from(c).map(node => {
      return node.innerText;
    })

    let oldSel = window.getSelection();

    this.updateBulletText(c.join(' '), i);


    //console.log(window.getSelection())
  }

  render() {
    let index = 0;

    return (
      <div>
        <div className="bullet-editor" style={{ width: this.props.width }}>
          {
            // Creat a bullet around each bullet
            this.state.bullets.map((bullet, i) => {
              index += 1; 
              return (
                <span
                  ref={this.ref}
                  key = {"span" + index.toString()}
                  className="bullet-editor-bullet">
                  <Bullet key={"bullet" + index.toString() + i.toString()} text={bullet} updateBulletText={this.updateBulletText} parentIndex={i} abbreviationData={this.props.abbreviationData} />
                </span>
              );
            })
          }
        </div>
        <div className="legend">Legend: 
          <span className="approved-abbreviation">Approved Abbreviation</span>
          <span className="abbreviable">Abbreviable Word</span>
        </div>
      </div>
      
    );
  }
}


const smallSpace = "\u2006"; // 1/6 em space [same as thinspace: \u2009]
const midSpace = "\u2005"; // 1/4 em space
const normalSpace = ' ';
const largeSpace = "\u2004"; // 1/3 em space (thick space)

class BulletOutputViewerBullet extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef()
    this.state = {
      idealHeight: null,
      idealWidth: null,
      optimized: false,
      bulletText: null,
    };
    this.processing = false;
    this.processed = false;
  }
  componentDidMount() {
    this.setState({ bulletText: this.props.bulletText })
    //this.evaluateBullet()
    //console.log("did mount")
  }

  componentDidUpdate(prevProps, prevState) {

    const { currentBulletText } = this.state;
    const { width } = this.props;

    let newBulletText = (prevState.bulletText !== currentBulletText && currentBulletText !== null);

    // We have a props update, clear everything and start over
    if (this.props.bulletText !== prevProps.bulletText | width !== prevProps.width) {
      console.log("did update with new props")
      this.processing = false;
      this.processed = false;
      this.setState({ bulletText: this.props.bulletText, optimized: false })
    } else if (newBulletText && !this.processing && !this.processed) {
      console.log("did update with new state to process"); 
      this.optimizeBullet();
      this.props.handleBulletChange(this.state.bulletText, this.props.index);
    }
  }

  xToPx = (x) => {
    let div = document.createElement('div');
    div.style.display = 'block';
    div.style.height = x;
    document.body.appendChild(div);
    let px = parseFloat(window.getComputedStyle(div, null).height);
    div.parentNode.removeChild(div);
    return px;
  }

  evaluateBullet = () => {

    if (this.ref === null) { return }

    const node = this.ref.current;
    const parentNode = node.parentNode;

    let idealWidth = this.xToPx(this.props.width);

    // // Undo wrapping so we get the single line height
    // node.style.whiteSpace = 'nowrap';

    // let idealHeight = node.getBoundingClientRect().height;
    let oldPWidth = parentNode.style.width;
    parentNode.style.width = "800.00mm";

    const { width, height } = node.getBoundingClientRect();

    // // Re-enable wrapping
    // node.style.whiteSpace = 'pre-wrap';
    // node.style.wordBreak = "break-word";
    parentNode.style.width = oldPWidth;

    let widthDiff = (width - idealWidth);

    // if (height > idealHeight + 2) {
    //   wrapped = true;
    // }

    
    ////console.log(`bullet width difference: ${widthDiff}`)
    return { "widthDiff": widthDiff };
  }
  getNormalBullet = (text) => {
    let output = text.split(/\s/);
    output.shift(); // remove hypen then add later
    output = output.join(' ');
    return "- " + output.trim();
  }
  getSmallestBullet = (text) => {
    let output = text.split(/\s/);
    output.shift(); // remove hypen then add later
    output = output.join(smallSpace);
    return "- " + output.trim();
  }
  getLargestBullet = (text) => {
    let output = text.split(/\s/);
    output.shift(); // remove hypen then add later
    output = output.join(largeSpace);
    return "- " + output.trim();
  }
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }
  async optimizeBullet() {
    let bullet = this.state.bulletText;
    if (bullet === null) { return; }
    this.processing = true;
    console.log("building bullet: " + bullet);
    bullet = this.getNormalBullet(bullet);
    await this.setStateAsync({ bulletText: bullet });
    let prevEval = this.evaluateBullet();
    let prevBullet = bullet;
    let grow = true;

    if(prevEval.widthDiff > -0.02 && prevEval.widthDiff < 0){
      // We are withing 1mm already
      console.log("Bullet Already Optimized")
      this.processed = true;
      this.processing = false;
      this.setState({bulletText: bullet, optimized: true });
      return;
    }

    if(prevEval.widthDiff > 0){
      // shrink bullet
      console.log("Shrinking Bullet: " +  bullet)
      grow = false;
    }else{
      console.log("Shrinking Bullet: " +  bullet)
    }

    let spaceIndexes = [];

    // Find position of all space chars
    Array.from(bullet).map((word, i) => {
      if (word.match(/\s/)) {
        spaceIndexes.push(i);
      }
      return;
    });
    
    spaceIndexes.shift(); // remove the first space since we dont want to add one after hypen
    
    let terminate = false;
    let useIndex = [];
    let action = 0;
    let len = spaceIndexes.length;
    let optim = true;

    // Shuffel up the space replacement
    for (let i = 0; i < len; i++) {
      switch (action) {
        case 0: useIndex.push(spaceIndexes.shift()); 
          break;// change space towards begining

        case 1: useIndex.push(spaceIndexes.pop());
          break;// Chjange space towards end

        case 2: 
          let val = spaceIndexes.splice(Math.floor(spaceIndexes.length/2),1)
          useIndex.push(val[0]);
          break; // Change space in the middle

        default:
          break;
      }
      action += 1;
      if (action === 3) { action = 0; }
    }

    while (!terminate) {
      if (useIndex.length === 0) {
        console.log("exhausted all index values")
        terminate = true;
        optim = false;
        continue;
      }

      const space = (grow) ? largeSpace : smallSpace;

      // Replace the index with the appropriate space char
      let i = useIndex.shift();
      bullet = bullet.substring(0, i) + space + bullet.substring(i + 1);
      
      // Re-evalute the size attributes
      await this.setStateAsync({ bulletText: bullet });
      let currentEval = this.evaluateBullet();

      if(grow){
        // IF we are still short of the line
        if (currentEval.widthDiff < 0) {
          // Still room to go.
          prevEval = currentEval;
          prevBullet = bullet;
          continue;
        }
        // If we past the line
        if (currentEval.widthDiff > 0) {
          // Grew to big keep the old bullet
          bullet = prevBullet;
          terminate = true;
          optim = true;
        }
      }else{
        
        if (currentEval.widthDiff > 0) {
          prevEval = currentEval;
          prevBullet = bullet;
          continue;
        }
        
        if (currentEval.widthDiff < 0) {
          optim = true;
          terminate = true;
        }
      }
      
    }

    // If we get here we should be optimized!
    this.processed = true;
    this.processing = false;
    this.setState({ bulletText: bullet, optimized: optim });

    return (bullet);
  }
  tweak = (sentence) => {
    // adds a 0-width space (\u200B) after forward slashes to cause them to wrap
    sentence = sentence.replace(/(\w)\//g, '$1/\u200B');

    // adds a non-breaking dash (\u2011) instead of a dash to prevent wrapping
    sentence = sentence.replace(/-/g, '\u2011');
    return sentence;
  }
  render() {

    const { optimized } = this.state;
    let className = optimized ? "bullet-output-bullet optimized" : "bullet-output-bullet notoptimized";
    return (

      <div className={className} ref={this.ref}>
        {this.state.bulletText}
      </div>
    );
  }
}

class BulletOutputViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bullets: [],
    };
    this.ref = React.createRef();
  }

  componentDidMount() {
    //console.log(this.props.bulletsText)
    this.setState({ bullets: this.extractBullets(this.props.bulletsText) })
  }

  componentDidUpdate(prevProps) {
    if (this.props.bulletsText !== prevProps.bulletsText) {
      this.setState({ bullets: this.extractBullets(this.props.bulletsText) })
    }
  }

  extractBullets = text => {
    let bullets = text.split(/-\s{1}/);
    bullets.shift();
    bullets = bullets.map((bullet) => {
      return bullet = "- " + bullet.trim() + '\r\n';
    });
    return bullets;
  }

  handleSelectionCopy = e => {
    e.preventDefault();
    let text = window.getSelection().toString();
    text = this.extractBullets(text);
    text = text.join('');
    text.replace(/\n/g, '\r\n'); //need this for WINDOWS!
    //console.log('Copy event: ' + text)
    e.clipboardData.setData('text/plain', text);

  }

  handleCopyButtonClick = (e) => {
    let range = document.createRange();
    range.selectNode(this.ref.current);
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges(); // clear current selection
  }

  handleBulletChange = (newText, i) => {
    let bullets = this.state.bullets;
    bullets[i] = newText;
    this.setState({ bullets: bullets })
  }

  render() {

    return (
      <div>
        <div className="bullet-output-container" style={{ width: this.props.width }}
          onCopy={this.handleSelectionCopy}>
          <p>XX. AMAZING BULLETS <mark>(Dont forget to copy to the right place!)</mark></p>
          <div ref={this.ref}>
            {
              
              // Create a bullet around each bullet
              this.state.bullets.map((bullet, i) => {

                return (<BulletOutputViewerBullet
                  width={this.props.width}
                  bulletText={bullet}
                  index={i}
                  key={i.toString()}
                  handleBulletChange={this.handleBulletChange}

                />);
              })
            }
          </div>
          
        </div>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={(e) => this.handleCopyButtonClick(e)}
          startIcon={<FileCopyIcon />}
        >
          Copy Bullets to Clipboard
        </Button>
      </div>
    );
  }
}

export { BulletOutputViewer, BulletEditor }
export default BulletEditor;