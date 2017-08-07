import React from 'react';
import WaveDetails from './WaveDetails.jsx';
import Request from 'superagent';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';
import {CSVLink, CSVDownload} from 'react-csv';
import FileDrop from './FileDrop.jsx';
import NVD3Chart from 'react-nvd3';

const styles = {
  button: {
    float: 'right'
  }
}

const file_types = ['ZCOP', 'ERD', 'Digi-Thon']

const items = ['Billable', 'Non-billable(Internal)', 'Non-billable(Customer)', 'Support', 'Free']

export default class WiproAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: {
        SRC: {},
        REPORT: {}
      },
      file: '',
      csvData: [],
      disableMerge: true,
      expandedSector: '',
      billableCount: 0,
      supportCount: 0,
      nonbillableCount: 0,
      FreeCount: 0,
      bcadets: [],
      nbiCadets: [],
      nbcCadets: [],
      fCadets: [],
      sCadets: [],
      value: null,
      billabilityGData: []
    }
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleMerge = this.handleMerge.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.getBillability = this.getBillability.bind(this);
    this.getNonBillabilityInternal = this.getNonBillabilityInternal.bind(this);
    this.getNonBillabilityCustomer = this.getNonBillabilityCustomer.bind(this);
    this.getBillabilitySupport = this.getBillabilitySupport.bind(this);
    this.getBillabilityFree = this.getBillabilityFree.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillMount() {
    this.getBillability();
    this.getNonBillabilityInternal();
    this.getNonBillabilityCustomer();
    this.getBillabilitySupport();
    this.getBillabilityFree();
  }

  handleFileChange(event, key, val) {
    this.setState({file: val})
  }

  handleDrop(acc, rej, type) {
    let files = this.state.files;
    if (type == 'REPORT') {
      files[type] = acc[0];
    } else {
      files['SRC'] = acc[0];
    }
    this.setState({files: files})
  }

  handleMerge() {
    console.log('Sending a request')
    let th = this;
    Request.post('/upload/merge?file=' + th.state.file).set({'Authorization': localStorage.getItem('token')}).attach('src', this.state.files.SRC).attach('report', this.state.files.REPORT).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log('File data', res.body)
        th.setState({csvData: res.body})
      }
    })
  }
  handleDownload() {}

  getBillability() {
    let th = this;
    Request.get('/dashboard/billable').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({bcadets: res.body, billableCount: res.body.length})
      }
    })
  }
  getNonBillabilityInternal() {
    let th = this;
    Request.get('/dashboard/nonbillableInternal').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({nonbillableInternalCount: res.body.length, nbCadets: res.body})
      }
    })
  }
  getNonBillabilityCustomer() {
    let th = this;
    Request.get('/dashboard/nonbillableCustomer').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({nonbillableCustomerCount: res.body.length, nbcCadets: res.body})
      }
    })
  }
  getBillabilityFree() {
    let th = this;
    Request.get('/dashboard/free').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({FreeCount: res.body.length, fCadets: res.body})
      }
    })
  }
  getBillabilitySupport() {
    let th = this;
    Request.get('/dashboard/support').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({supportCount: res.body.length, sCadets: res.body})
      }
    })
  }
  handleChange(event, key, values) {
    console.log(values)
    this.setState({value: values, billabilityGData: key})
  }
  render() {
    let th = this;
    console.log(this.state.value, "values")

    const data = [
      {
        label: 'Billable',
        value: this.state.billableCount,
        color: "#F9CB40",
        members: this.state.bcadets
      }, {
        label: "Non-billable(Internal)",
        value: this.state.nonbillableInternalCount,
        color: "#FF715B",
        members: this.state.nbiCadets
      }, {
        label: "Non-billable(Customer)",
        value: this.state.nonbillableCustomerCount,
        color: "#06D6A0",
        members: this.state.nbcCadets
      }, {
        label: "Free",
        value: this.state.FreeCount,
        color: "#BCED09",
        members: this.state.fCadets
      }, {
        label: "Support",
        value: this.state.supportCount,
        color: "#2F52E0",
        members: this.state.sCadets
      }
    ]
    var datavalue = [];
    if (this.state.value != null) {
      this.state.value.map(function(val, k) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].label === val) {
            console.log(data[i].label)
            datavalue.push(data[i])
          }
        }
      })
    }
    console.log(datavalue, "datavalue")
    return (
      <div>
        <Grid>
          <Row>
            <Col md={5}>
              <SelectField value={this.state.value} onChange={this.handleChange} multiple={true} floatingLabelText="Select Billability">
                {
                  items.map(function(item, key) {
                    return <MenuItem key={key} value={item} primaryText={item}/>
                  })
                }
              </SelectField>

              <NVD3Chart id="pieChart" type="pieChart" tooltip={{
                enabled: true
              }} datum={datavalue} x="label" y="value" width="550" height="600"/>
            </Col>

            <Col md={3} mdOffset={1}>
              <SelectField value={this.state.file} onChange={this.handleFileChange} floatingLabelText="Select File">
                {
                  file_types.map(function(file, key) {
                    return <MenuItem key={key} value={file} primaryText={file}/>
                  })
                }
              </SelectField>
              <RaisedButton label="Merge" primary={true} onClick={this.handleMerge}/>
              <br/>
              <CSVLink data={this.state.csvData} filename="da_db.xlsx" style={styles.button}>
                Download
              </CSVLink>
            </Col>
            <Col md={3}>
              <FileDrop type={this.state.file} handleDrop={this.handleDrop}/>
              <br/>
              <FileDrop type="REPORT" handleDrop={this.handleDrop}/>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }

}
