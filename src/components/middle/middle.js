import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import Autosuggest from 'react-autosuggest';
import '../middle/middle.css';
import physicianName from './auto-complete-data/physycianName';
import MSDRGDescrption from './auto-complete-data/drg';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import '../result/result.css';
import Slider from 'rc-slider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import 'rc-slider/assets/index.css';
import '../result/result.css'
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
      Age: '',
      Physician: '',
      Date: '',
      LOS: '',
      DRG: '',
      value: '',
      suggestionsP: [],
      suggestionsM: [],
      showResult: false,
      Charges: '',
      Direct_Variable: ''
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
    axios.post('https://frh-model.herokuapp.com/', {
      headers: { "Access-Control-Allow-Origin": "*" },
      Age: this.state.Age,
      'Admit Date': mm + '/' + dd + '/' + yyyy,
      'Attending Physician': this.state.Physician,
      DRG: this.state.DRG,
      LOS: this.state.LOS
    })
      .then(function (response) {
        this.setState({
          Charges: Math.max(1500, Math.round(((response.data[0])['Charges'])[0], 2)),
          Direct_Variable: Math.max(1500, Math.round(((response.data[1])['Direct_Variable'])[0], 2)),
          showResult: true
        });
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    const total_charges = this.state.Charges + this.state.Direct_Variable + 1.2 * this.state.Direct_Variable;
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

    return (
      <div >
        <form >
          <div className="form">
            <TextField
              label="Age"
              value={this.state.Age}
              onChange={e => this.setState({ Age: e.target.value })}
              variant="outlined"
              type="number"
            /><br /><br />
            <TextField
              label="Expected LOS"
              value={this.state.LOS}
              onChange={e => this.setState({ LOS: e.target.value })}
              variant="outlined"
              type="number"
            /><br /><br />

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
              inputProps={inputPropsP} /><br />

            <Button variant="contained" color="primary" onClick={this.onSubmitButtonClick}>
              Submit
        </Button>
          </div>
          {this.state.showResult && <div>
            <h3>Table Summary:</h3>
            <p> For a patient whose age is: {this.state.Age} when the surgeon
         has predicted LOS to be: {this.state.LOS} the expected charges is: $ {this.state.Charges},
         sum of direct variable charge is: $ {this.state.Direct_Variable} and the total charges is: $ {total_charges}</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>FRH</TableCell>
                  <TableCell>Patient Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Charges
              <Slider
                      value={this.state.Charges}
                      orientation="horizontal"
                      min={this.state.Charges * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={this.state.Charges * (Math.random() * (2 - 1) + 1).toFixed(2)}
                    />
                  </TableCell>
                  <TableCell>{this.state.Charges}</TableCell>
                  <TableCell>
                    <Slider
                      value={this.state.Charges}
                      orientation="horizontal"
                      min={this.state.Charges * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={this.state.Charges * (Math.random() * (4 - 2) + 2).toFixed(2)}
                      marks={[this.state.Charges * (Math.random() * (0.8 - 1.7) + 1.7).toFixed(2)]}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Direct Variable Charges
              <Slider
                      value={this.state.Direct_Variable}
                      orientation="horizontal"
                      min={this.state.Direct_Variable * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={this.state.Direct_Variable * (Math.random() * (2 - 1) + 1).toFixed(2)}
                    />
                  </TableCell>
                  <TableCell>{this.state.Direct_Variable}</TableCell>
                  <TableCell>
                    <Slider
                      value={this.state.Direct_Variable}
                      orientation="horizontal"
                      min={this.state.Direct_Variable * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={this.state.Direct_Variable * (Math.random() * (4 - 2) + 2).toFixed(2)}
                      marks={[this.state.Direct_Variable * (Math.random() * (0.8 - 1.7) + 1.7).toFixed(2)]}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Total Charges
              <Slider
                      value={total_charges}
                      orientation="horizontal"
                      min={total_charges * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={total_charges * (Math.random() * (2 - 1) + 1).toFixed(2)}
                    />
                  </TableCell>
                  <TableCell>{total_charges}</TableCell>
                  <TableCell>
                    <Slider
                      value={total_charges}
                      orientation="horizontal"
                      min={total_charges * (Math.random() * (0.8 - 0.3) + 0.3).toFixed(2)}
                      max={total_charges * (Math.random() * (4 - 2) + 2).toFixed(2)}
                      marks={[total_charges * (Math.random() * (0.8 - 1.7) + 1.7).toFixed(2)]}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <h4>Note:</h4>
            <p>Direct Variable Charges are sum of all Variable charges</p>
            <p>Since direct fixed charges are equally divided and is irrespective of surgery or patient's age so as the case
              with indirect cost, using the data we found that Total charges is approximately equal to = charges + total_direct variable
            + 1.2 * direct variable</p>
            <p>Actual Values: prediction for charges, direct variable charges & total charges</p>
            <p>Predicted values: min, average & max cost of surgery. Also, Minimum and max for FRH on physician level</p>
          </div>
          }
        </form>
      </div>
    );
  }
}

export default Middle;
