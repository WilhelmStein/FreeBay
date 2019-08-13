import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

class AdminPage extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {

        }
    }

    componentDidMount()
    {
        if (!this.props.user || !this.props.user.admin)
        {
            this.props.history.push("/");
        }
    }

    render()
    {
        return null;
    }
}

export default withRouter(AdminPage);