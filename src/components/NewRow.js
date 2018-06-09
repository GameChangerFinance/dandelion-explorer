import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import TextField from '@material-ui/core/TextField';
import { withStyles, Divider, Paper } from '@material-ui/core';

import axios from 'axios';

let lib = require('../utils/library.js');

class ResponsiveDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            dbIndex: props.dbIndex,
            table: props.table,
            columns: props.columns,
            allColumns: props.allColumns,
            primaryKeys: props.primaryKeys || [],
            qbFilters: props.qbFilters || [],
            url: props.url,
            inputVals: {},
            error: ""
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            open: newProps.open,
            dbIndex: newProps.dbIndex,
            table: newProps.table,
            columns: newProps.columns,
            allColumns: newProps.allColumns,
            primaryKeys: newProps.primaryKeys || [],
            qbFilters: newProps.qbFilters || [],
            url: newProps.url
        });
    }

    handleClose = () => {
        this.props.handleNewRowClick(false);
    };

    // Reset all input fields
    handleReset = () => {
        let qbFiltersTemp = this.state.qbFilters;
        this.setState({
            qbFilters: []
        }, () => {
            this.setState({
                qbFilters: qbFiltersTemp,
                inputVals: {}
            })
        });
    };

    handleInput = (event, column, dataType) => {
        let value = event.target.value; // New value from user
        let inputValues = this.state.inputVals || {};

        if (value === "") {
            delete inputValues[column];
        } else {
            inputValues[column] = inputValues[column] || {};
            inputValues[column]["value"] = value;
            inputValues[column]["dataType"] = dataType;
        }

        this.setState({
            inputVals: inputValues
        }, () => {
            //console.log(JSON.stringify(this.state.inputVals));
        });
    }

    sanitizeInput() {
        let input = this.state.inputVals;
        let keys = Object.keys(this.state.inputVals);

        let newRowURL = lib.getDbConfig(this.state.dbIndex, "url") + "/" + this.state.table;
        let postReqBody = {};

        for (let i = 0; i < keys.length; i++) {
            let column = keys[i];
            let rawValue = input[keys[i]]["value"];
            let dataType = input[keys[i]]["dataType"];
            let value = rawValue;

            if (dataType === "string") {
                value = String(rawValue);
            }
            else if (dataType === "integer" || dataType === "double") {
                value = Number(rawValue);
            }
            else if (dataType === "boolean") {
                value = Boolean(rawValue);
            }

            postReqBody[column] = value;
        }

        console.log("Changes Log URL:" + newRowURL);
        console.log("Changes Log POST Body:" + JSON.stringify(postReqBody));

        axios.post(newRowURL, postReqBody, { headers: { Prefer: 'return=representation' } })
            .then((response) => {
                //console.log("Change Log POST Successful:" + JSON.stringify(response));
            })
            .catch((error) => {
                console.log(JSON.stringify(error.response));
                // Show error in Snack-Bar
                this.setState({
                    error: error.response,
                    snackBarVisibility: true,
                    snackBarMessage: "Error committing CHANGE LOG!"
                }, () => {
                    this.timer = setTimeout(() => {
                        this.setState({
                            snackBarVisibility: false,
                            snackBarMessage: "Unknown error"
                        });
                    }, 5000);
                });
            });

    }

    handleSubmit = () => {
        // Submit HTTP Request
        // If successful, close it; else show the error as it is...
        this.sanitizeInput();
    };

    render() {
        const classes = this.props.classes;
        let { fullScreen } = this.props;
        let tableRename = lib.getTableConfig(this.state.dbIndex, this.state.table, "rename");
        let tableDisplayName = tableRename ? tableRename : this.state.table;

        return (
            <div>
                <Dialog
                    fullScreen={fullScreen}
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="responsive-dialog-title">
                    <DialogTitle id="responsive-dialog-title">{"Insert new row to " + tableDisplayName}</DialogTitle>
                    <DialogContent>
                        <Paper className={classes.paperError} elevation={4}>
                            <Typography variant="subheading" className={classes.cardMarginTopBottom}>Request Denied</Typography>
                            <DialogContentText>{"Code: " + (this.state.error && this.state.error.data ? this.state.error.data.code : "")}</DialogContentText>
                            <DialogContentText>{"Hint: " + (this.state.error && this.state.error.data ? this.state.error.data.hint : "")}</DialogContentText>
                            <DialogContentText>{"Message: " + (this.state.error && this.state.error.data ? this.state.error.data.message : "")}</DialogContentText>
                            <DialogContentText>{"Details: " + (this.state.error && this.state.error.data ? this.state.error.data.details : "")}</DialogContentText>
                        </Paper>

                        <Typography type="subheading" className={classes.cardMarginTopBottom}>New Row</Typography>
                        <div className={classes.cardMarginLeft}>
                            {
                                this.state.qbFilters.map((column) => {
                                    return (
                                        <TextField
                                            onChange={(e) => this.handleInput(e, column.id, column.type)}
                                            key={column.id}
                                            label={column.label ? column.label : column.id}
                                            required={(this.state.primaryKeys).indexOf(column.id) >= 0}
                                            placeholder={column.type}
                                            value={(column.default_value || (this.state.inputVals[column.id] ? this.state.inputVals[column.id]["value"] : "")) || ""}
                                            className={classes.textField}
                                            margin="normal" />
                                    )
                                })
                            }
                        </div>
                    </DialogContent>
                    <Divider />
                    <DialogActions>
                        <Button onClick={this.handleClose} >Cancel</Button>
                        <Button onClick={this.handleReset} >Reset</Button>
                        <Button onClick={this.handleSubmit} color="secondary" autoFocus>Submit</Button>
                    </DialogActions>
                </Dialog>
            </div >
        );
    }
}

const styleSheet = {
    cardMarginTopBottom: { // For items within the same section
        marginBottom: 8,
        marginTop: 16
    },
    cardMarginLeft: {
        marginLeft: 16
    },
    textField: {
        width: 60 + '%',
    },
    paperError: {
        background: "pink",
        color: "white"
    }
};


ResponsiveDialog.propTypes = {
    fullScreen: PropTypes.bool.isRequired,
};

export default withStyles(styleSheet)(withMobileDialog()(ResponsiveDialog));