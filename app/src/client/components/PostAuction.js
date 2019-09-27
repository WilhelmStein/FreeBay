import React, {Component} from 'react';
import autoBind from 'auto-bind';
import axios from 'axios';

import { Dialog, DialogTitle, DialogContent, Grid, TextField, DialogActions, Button} from '@material-ui/core';

export default class PostAuction extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            categoryOptions: [],
            name: "",

        }

        this.fields = [
            {label: "Name", type: "text", name: "Name", placeholder: "AWESOME Coffee Mugs - Wonder Emporium"},
            {label: "Description", type: "text", name: "Description", placeholder: "..."},
            {label: "Starting Price", type: "number", name: "Starting Price", placeholder: "25.00"}
        ]

        autoBind(this);
    }

    componentDidMount()
    {
        axios.get("/api/categories")
        .then(res => {
            if (res.data.error)
            {
                console.error(res.message);
            }
            else
            {
                this.setState({
                    categoryOptions: res.data.data
                })
            }
        })
        .catch(err => console.log(err));
    }

    onOpen()
    {
        if (!this.props.user.Validated)
        {
            console.log("Not Validated")
        }
    }

    closeDialog()
    {
        this.clearState();
        this.props.toggleDialog();
    }

    clearState()
    {

    }

    post()
    {
        this.closeDialog();
    }

    render()
    {
        return (
            <Dialog 
                open={this.props.open}
                onClose={this.closeDialog}
                onEnter={this.onOpen}
            >
                <DialogTitle>Post New Auction</DialogTitle>
                <DialogActions>
                    <Button onClick={this.closeDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.post} color="primary">
                        Post
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}