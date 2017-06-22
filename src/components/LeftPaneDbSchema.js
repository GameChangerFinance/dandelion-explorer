import React, { Component } from 'react';
import axios from 'axios';

let lib = require('../utils/library.js');

class LeftPaneDbSchema extends Component {
	constructor(props) {
		super(props);
		this.state = { rawResp: "", tables: [] };
	}

	handleTableClick(e) {
		let buttonClicked = e.target.id;

		//Can use the below to propogate table change back to index.js
		this.props.changeTargetTable(buttonClicked);

		// If the columns are already known and displayed, then hide them
		if (this.state[buttonClicked]) {
			this.setState({
				[buttonClicked]: null
			});
			this.props.changeTargetTable(lib.getFromConfig("noTableMsg"));
			this.props.changeTargetTableColumns([]);
			this.props.changeSelectTableColumns([]);
		} else {
			// before showing any table's columns, hide any other open tables
			for (let i = 0; i < this.state.tables.length; i++) {
				this.setState({
					[this.state.tables[i]]: null
				})
			}
			this.fetchTableColumns(buttonClicked);
		}
	}

	handleColumnClick(e) {
		let columnClicked = e.target.id;
		this.props.addRemoveSelectTableColumns(columnClicked);
	}

	// Prudces the buttons for the COLUMNS
	displayColumns(table) {
		let ret = [];
		let columns = this.state[table];
		if (columns) {
			for (let i = 0; i < columns.length; i++) {
				ret.push(
					<div key={i}>
					<button key={i} id={columns[i]} className="columnsButtons" onClick={this.handleColumnClick.bind(this)}>{columns[i]}</button>
				</div>
				);
			}
		}
		return ret;
	}

	// Produces buttons for the TABLES
	displayTables(listOfTables = this.state.tables) {
		let ret = [];
		for (let i = 0; i < listOfTables.length; i++) {
			ret.push(
				<div key={i}>
					<button key={i} id={listOfTables[i]} className="tablesButtons" onClick={this.handleTableClick.bind(this)}>{listOfTables[i]}</button>
					{this.displayColumns(listOfTables[i])}
				</div>
			);
		}
		return ret;
	}

	// Extract the names of db tables and update state
	parseTables(rawResp = this.state.rawResp) {
		let dbTables = [];
		for (let i in rawResp.definitions) {
			dbTables.push(i);
		}
		this.setState({ tables: dbTables });
	}

	// Extract the names of db tables and update state
	parseTableColumns(rawResp, table) {
		let columns = [];
		let selectColumns = [];
		for (let i in rawResp) {
			columns.push(i);
			selectColumns.push(i);
		}
		this.setState({
			[table]: columns
		});
		this.props.changeTargetTableColumns(columns);
		this.props.changeSelectTableColumns(selectColumns);
	}

	// Makes a GET call to '/' to retrieve the db schema from PostgREST
	fetchDbSchema(url = lib.getFromConfig('baseUrl') + '/') {
		axios.get(url, { params: {} })
			.then((response) => {
				this.parseTables(response.data);
			})
			.catch(function(error) {
				console.log(error);
			});
	}

	// Gets the columns of the specified table, uses the OPTIONS method
	fetchTableColumns(table) {
		let url = lib.getFromConfig("baseUrl") + "/";
		axios.get(url, { params: {} })
			.then((response) => {
				this.parseTableColumns(response.data.definitions[table].properties, table);
			})
			.catch(function(error) {
				console.log(error);
			});
	}

	// Makes the API call once the basic UI has been rendered
	componentDidMount() {
		this.fetchDbSchema();
	}

	render() {
		return (
			<div id="tagsDiv">
				{this.displayTables()}
			</div>
		);
	}
}

export default LeftPaneDbSchema;
