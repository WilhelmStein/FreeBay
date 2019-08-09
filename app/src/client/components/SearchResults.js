import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { Link, withRouter } from 'react-router-dom';
import axios from "axios"


class SearchResults extends Component
{
    constructor(props)
    {
        super(props);

        autoBind(this);
    }

    componentDidMount()
    {
        const regex =  /{(.*?)}/g;

        var params = this.props.location.search.match(regex);

        var category = params[0].replace(/{|}/g, '');
        var text = params[1].replace(/{|}/g, '');

        axios.post("/api/search", {
            category: category,
            text: text
        })
        .then(res => {
            // Get results and load them
        })
        .catch(err => console.log(err));
    }

    render()
    {
        return (
            null
        );
    }
}

export default withRouter(SearchResults);