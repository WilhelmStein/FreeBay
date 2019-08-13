import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";



class AuctionPage extends Component
{
    constructor(props)
    {
        super(props);
        autoBind(this);
    }

    componentDidMount()
    {
        const regex =  /{(.*?)}/g;

        const auctionId = this.props.location.search.match(regex)[0].replace(/{|}/g, '');

        console.log(auctionId);

        this.setState({
            auctionId: auctionId
        })

        axios.post("/api/auction", {
            auctionId: auctionId
        })
        .then(res => {
            this.setState({
                auction: res.data.data
            })
        })
        .catch(err => console.log(err));
    }

    render()
    {
        return null;
    }
}

export default withRouter(AuctionPage);