import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Checkbox from 'material-ui/Checkbox';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ArrowDropUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import Slider from 'material-ui/Slider';

const styles = {
	filterBody: {
		padding: '5px',
		width: '100%'
	},
	autoComplete: {
		width: '100%',
		padding: '3px'
	},
	radioButton: {
		width: '100%',
		padding: '3px'
	}
}

export default class FilterItem extends React.Component {

	constructor(props) {
		super(props)
    this.state = {
      accordion: 'none',
      accordionType: '',
      values: [],
      selectedValue: ''
    };
		this.toggleAccordion = this.toggleAccordion.bind(this);
		this.getSliderValue = this.getSliderValue.bind(this);
		this.addFilter = this.addFilter.bind(this);
    this.getAccordianValues = this.getAccordianValues.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
  }

  toggleAccordion() {
		let th = this;
    if(this.state.accordion == 'none') {
			if(this.getAccordianValues() > 0) {
	      this.setState({
	        accordion: 'block'
	      });
			} else {
				this.props.onOpenSnackbar(`Sorry! No values found against ${th.props.title} in the database.`);
			}
    } else {
      this.setState({
				selectedValue: '',
				accordion: 'none'
      });
    }
  }

  getAccordianValues() {
    let values = this.props.onGetAccordianValues();
    console.log('Accordian values', values)
    this.setState({
      values: values
    });
		return values.length;
  }

  getSliderValue(value) {
  	this.setState({
  		selectedValue: value
  	})
  }

	handleUpdate(value) {
		this.setState({
			selectedValue: value
		})
	}

	addFilter(value) {
		this.setState({
			selectedValue: '',
			accordion: 'none'
		});
		console.log('Selected Value: ', this.state.selectedValue);
		this.props.onAddFilter(value);
	}

  render() {
		let th = this;
		let content;
		if(this.props.type == 'AutoComplete') {
				content = (
					<div style={{display: this.state.accordion}}>
						<AutoComplete
							filter={AutoComplete.fuzzyFilter}
							dataSource={th.state.values}
							searchText={th.state.selectedValue}
							onUpdateInput={th.handleUpdate}
							onNewRequest={th.addFilter}
							style={styles.autoComplete}
						/>
					</div>
				);
		} else if(this.props.type == 'CheckBox') {
				content = (
					<div style={{display: this.state.accordion, width: '100%', border: '2px solid silver', padding: '3px'}}>
						{
							this.state.values.map(function(value, key) {
								return (
									<Checkbox
										label={value}
										value={value}
										key={key}
										onCheck={(e, isChecked)=>{
											if(isChecked) th.addFilter(value);
										}}
									/>
								)
							})
						}
					</div>
				);
		} else if(this.props.type == 'RadioButton') {
			content = (
				<div style={{display: this.state.accordion}}>
					<RadioButtonGroup
						name={this.props.title}
						style={styles.radioButton}
						onChange={(e)=>{e.persist(); th.addFilter(e.target.value);}}
					>
						{
							this.state.values.map(function(value, index) {
								return (
									<RadioButton
										style={{width: '50%', display: 'inline-block', boxSizing: 'border-box'}}
										value={value}
										label={value}
										key={index}
									/>
								)
							})
						}
					</RadioButtonGroup>
				</div>
			);
		} else if(this.props.type == 'Slider') {
			content = (
				<div style={{
					display: this.state.accordion,
					width: '100%',
					// border: '2px solid silver',
					padding: '3px',
					height: '70px'
				}}>
					<span style={{padding: '2px'}}>Above: {this.state.selectedValue}</span>
					<Slider
						min={this.state.values[0]}
						max={this.state.values[1]}
						step={1}
						onChange={(e, value)=>this.getSliderValue(value)}
						onDragStop={()=>th.addFilter(this.state.selectedValue)}
					/>
				</div>
			);
		}
    return (
      <div>
        <div style={styles.filterBody}>
					<div style={{width: '90%', display: 'inline-block'}}>{this.props.title}</div>
					<div style={{display: 'inline-block'}} onTouchTap={this.toggleAccordion}>
						{
							this.state.accordion == 'none' ?
							<ArrowDropDownIcon style={{color: '#000'}}/> :
							<ArrowDropUpIcon style={{color: '#000'}}/>
						}
					</div>
				</div>
				{content}
      </div>
    )
  }
}
