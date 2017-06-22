import React from 'react';
import ReactDOM from 'react-dom';

import Navigation from './components/Navigation';
import LeftPane from './components/LeftPane';
import MiddlePane from './components/MiddlePane';

import HistoryPane from './components/HistoryPane';

import './styles/index.css';

let lib = require("./utils/library.js");

export default class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			targetTable: lib.getFromConfig("noTableMsg"),
			targetTableColumns: [],
			selectTableColumns: []
		};
	}

	changeTargetTable(newTable) {
		this.setState({ targetTable: newTable });
	}

	changeTargetTableColumns(newTableColumns) {
		this.setState({ targetTableColumns: newTableColumns });
	}

	changeSelectTableColumns(newSelectColumns) {
		this.setState({ selectTableColumns: newSelectColumns });
	}

	addRemoveSelectTableColumns(column) {
		console.log("Adding or removing column " + column);

		let currentColumns = this.state.selectTableColumns;
		let index = currentColumns.indexOf(column);
		console.log("index = " + index);

		if (index >= 0) {
			// remove it
			currentColumns.splice(index, 1);
		} else {
			// add it
			currentColumns.push(column);
		}
		this.setState({ selectTableColumns: currentColumns });
	}

	render() {
		return (
			<div>
				<Navigation />
				<LeftPane 	changeTargetTable={this.changeTargetTable.bind(this)}
							changeTargetTableColumns={this.changeTargetTableColumns.bind(this)}
							changeSelectTableColumns={this.changeSelectTableColumns.bind(this)}
							addRemoveSelectTableColumns={this.addRemoveSelectTableColumns.bind(this)} />
				<MiddlePane table={this.state.targetTable}
							columns={this.state.targetTableColumns}
							selectColumns={this.state.selectTableColumns} />
				<HistoryPane />
			</div>
		);
	}
}

const app = document.getElementById('root');
ReactDOM.render(<Layout/>, app);
