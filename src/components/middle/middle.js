import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import Autosuggest from 'react-autosuggest';
import '../middle/middle.css';
import physicianName from './auto-complete-data/physycianName';
import MSDRGDescrption from './auto-complete-data/drg';
import axios from 'axios';
import '../result/result.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import '../result/result.css';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import SwipeableViews from 'react-swipeable-views';
import trend from './images/trend.JPG';
import StarRatings from 'react-star-ratings';
import TextField from '@material-ui/core/TextField';

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestionsP(value) {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('\\b' + escapedValue, 'i');
  return physicianName.filter(physicianName => regex.test(physicianName));
}
function getSuggestionsM(value) {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('\\b' + escapedValue, 'i');
  return MSDRGDescrption.filter(MSDRGDescrption => regex.test(MSDRGDescrption));
}

function getSuggestionValue(suggestion) {
  return suggestion;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion}</span>
  );
}


class Middle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Physician: '',
      Date: '',
      DRG: '',
      value: '',
      suggestionsP: [],
      suggestionsM: [],
      showResult: false,
      Direct_Variable_total: '',
      other_costs: '',
      Charges: '',
      Diabetic: false,
      LOS: '',
      password: ''
    };
  }


  onChangeP = (event, { newValue, method }) => {
    this.setState({
      Physician: newValue
    });
  };

  onChangeM = (event, { newValue, method }) => {
    this.setState({
      DRG: newValue
    });
  };

  onSuggestionsFetchRequestedP = ({ value }) => {
    this.setState({
      suggestionsP: getSuggestionsP(value)
    });
  };
  onSuggestionsFetchRequestedM = ({ value }) => {
    this.setState({
      suggestionsM: getSuggestionsM(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestionsP: [],
      suggestionsM: []
    });
  };

  onSubmitButtonClick = () => {
    //https://hype.codes/how-get-current-date-javascript
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }
    var diabeticFactor = 1;
    if (this.state.Diabetic) {
      diabeticFactor = 1.20;
    }
    if (this.state.password === 'capstone') {
      axios.post('https://frh-model.herokuapp.com/Costs', {
        headers: { "Access-Control-Allow-Origin": "*" },
        DRG: this.state.DRG,
        'Admit Date': mm + '/' + dd + '/' + yyyy,
        'Attending Physician': this.state.Physician,
        D_Factor: diabeticFactor
      }).then(function (response) {
        this.setState({
          LOS: Math.round((response.data[3])['LOS'], 2),
          Direct_Variable_total: Math.max(1500, Math.round(((response.data[0])['total_direct_variable'])[0], 2)),
          other_costs: Math.max(1500, Math.round(((response.data[2])['total_other'])[0], 2)),
          Charges: Math.max(1500, Math.round(((response.data[1])['total_Charges'])[0], 2)),
          showResult: true
        });
      }.bind(this))
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  render() {
    const { suggestionsP, suggestionsM, Physician, DRG } = this.state;
    const inputPropsP = {
      placeholder: "Physician Name",
      value: Physician,
      onChange: this.onChangeP,
    };
    const inputPropsM = {
      placeholder: "Treatment",
      value: DRG,
      onChange: this.onChangeM,
    };
    const password = this.state.password;
    if (password !== 'capstone') {
      return <div className="form">
        <TextField
          label="password"
          value={this.state.password}
          onChange={e => this.setState({ password: e.target.value })}
          margin="normal"
          variant="outlined"
        />
      </div>
    } else {
      return (
        <div >
          <form >
            <div className="form">

              <Autosuggest
                suggestions={suggestionsM}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedM}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputPropsM} /><br />

              <Autosuggest
                suggestions={suggestionsP}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedP}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputPropsP} />

              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.Diabetic}
                    onChange={e => this.setState({ Diabetic: e.target.checked })}
                    value="true"
                  />
                }
                labelPlacement="start"
                label="Diabetic?"
              />
              <Button variant="outlined" color="primary" onClick={this.onSubmitButtonClick}>
                Predict
          </Button>
            </div>
            <br />
            {this.state.showResult && <div>
              <h3>Results from prediction:</h3>
              For <strong>{this.state.DRG}</strong><br />
              The expected LOS is: <strong>{this.state.LOS}</strong><br />
              This leads to an estimated costs of: <strong>${(this.state.Direct_Variable_total + this.state.other_costs).toLocaleString()}</strong><br />
              The total "Controllable" cost is: <strong>${this.state.Direct_Variable_total.toLocaleString()}</strong>,(<strong>{(Math.round(this.state.Direct_Variable_total / (this.state.Direct_Variable_total + this.state.other_costs) * 100, 2)).toLocaleString()}
                %</strong>of the total costs)<br /><br />
              <table>
                <tr>
                  <th>Metric</th>
                  <th>Amount</th>
                  <th>Benchmark*</th>
                </tr>
                <tr>
                  <td>Total Charges</td>
                  <td>${this.state.Charges.toLocaleString()}</td>
                  <td>
                    <Slider
                      value={this.state.Charges}
                      orientation="horizontal"
                      min={this.state.Charges * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={this.state.Charges * (Math.random() * (2 - 1) + 1).toFixed(2)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Total Costs</td>
                  <td>${(this.state.Direct_Variable_total + this.state.other_costs).toLocaleString()}</td>
                  <td>
                    <Slider
                      value={this.state.Direct_Variable_total + this.state.other_costs}
                      orientation="horizontal"
                      min={(this.state.Direct_Variable_total + this.state.other_costs) * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={(this.state.Direct_Variable_total + this.state.other_costs) * (Math.random() * (2 - 1) + 1).toFixed(2)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Costs/Charge Ratio</td>
                  <td colspan="2" align="center">{Math.round((this.state.Direct_Variable_total + this.state.other_costs) / this.state.Charges * 100, 2)}%</td>
                </tr>
                <tr>
                  <td>Total "Controllable" cost</td>
                  <td>${this.state.Direct_Variable_total.toLocaleString()}</td>
                  <td>
                    <Slider
                      value={this.state.Direct_Variable_total}
                      orientation="horizontal"
                      min={this.state.Direct_Variable_total * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={this.state.Direct_Variable_total * (Math.random() * (2 - 1) + 1).toFixed(2)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>"Controllable"/ Total Cost Ratio</td>
                  <td colspan="2" align="center">{Math.round(this.state.Direct_Variable_total / (this.state.Direct_Variable_total + this.state.other_costs) * 100, 2)}%</td>
                </tr>
                <tr><td></td></tr>
                <tr>
                  <td>NPS *</td>
                  <td colspan="2" align="center">
                    <StarRatings
                      rating={(Math.random() * (5 - 3) + 3)}
                      starRatedColor="green"
                      numberOfStars={5}
                      starDimension="20px"
                      starSpacing="1px"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Expected LOS</td>
                  <td colspan="2" align="center">{this.state.LOS} Days</td>
                </tr>
                <tr>
                  <td>Quality of outcome *</td>
                  <td colspan="2" align="center">
                    <label><input type="radio" value="option1" checked={false} />Red</label><br />
                    <label><input type="radio" value="option1" checked={false} />Yellow</label><br />
                    <label><input type="radio" value="option1" checked={true} />Green</label>
                  </td>
                </tr>
              </table>
              <h3>Trend Charts *</h3>
              <SwipeableViews>
                <div className='ResultArea'>
                  <h3>Charges</h3>
                  <img src={trend} alt="Charge trends" />
                  <br />
                </div>
                <div className='ResultArea'>
                  <h3>Costs</h3>
                  <img src={trend} alt="Charge trends" />
                  <br />
                </div>
                <div className='ResultArea'>
                  <h3>"Controllable" Fixed Cost</h3>
                  <img src={trend} alt="Charge trends" />
                  <br />
                </div>
              </SwipeableViews>
              <p> Note: * indicated a value that is randomized, this is not a predicted value.</p>
            </div>}
          </form>
        </div>
      );
    }
  }
}

export default Middle;
