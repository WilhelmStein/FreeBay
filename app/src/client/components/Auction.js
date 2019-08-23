import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";


class AuctionPage extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            id: props.match.params.id,
            auction: null
        };

        autoBind(this);
    }

    componentDidMount()
    {
        axios.get(`/api/auction?id=${this.state.id}`)
        .then(res => {
            this.setState({
                auction: res.data.data
            }, () => console.log(this.state))
        })
        .catch(err => console.log(err));
    }

    image(url)
    {
        return (
            <div>
                <img src={url}></img>
            </div>
        );
    }

    render()
    {
        if (this.state.auction === null)
            return null;

        return (
            <div className="auction">
                <h2 className="auction-title">{this.state.auction.Name}</h2>
                <div className="auction-images">
                    {(this.state.auction.Images.length != 0
                    ?
                    this.state.auction.Images.map(image => this.image(`/api/image?path=${image.Path}`))
                    :
                    this.image("https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"))
                    }
                </div>
                <div className="auction-location">
                    <h3>{this.state.auction.Location}</h3>
                    <h4>{this.state.auction.Latitude}</h4>
                    <h4>{this.state.auction.Longitude}</h4>
                </div>
                <div className="auction-duration">
                    <h3>{this.state.auction.Started} - {this.state.auction.Ended}</h3>
                </div>
            </div>
        );
    }
}

export default withRouter(AuctionPage);

