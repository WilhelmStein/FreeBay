import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import Carousel from './Carousel'
import { Paper, Grid } from '@material-ui/core';
import { Card, CardHeader, CardMedia, CardContent, CardActions } from '@material-ui/core';
import { Typography } from '@material-ui/core'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

import '../style/Auction.scss';

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
                <img alt={`${url}`} src={url}/>
            </div>
        );
    }

    render()
    {
        if (this.state.auction === null)
            return null;

        const position = this.state.auction.Latitude && this.state.auction.Longitude ? [this.state.auction.Latitude, this.state.auction.Longitude] : null;

        return (
            <Paper className="AuctionPage">
                <Grid container spacing={2}>

                    <Grid item xs={5}>
                        <Images images={this.state.auction.Images.length === 0 ? [{Id: -1, Path: "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}] : this.state.auction.Images}/>
                    </Grid>

                    <Grid item xs={5}>
                            <CardHeader
                                title={this.state.auction.Name}
                                subheader={`${this.state.auction.User.Username} - ${this.state.auction.User.Rating}`}
                            />

                            <Typography variant="body2" color="textSecondary" component="p">
                                {this.state.auction.Description}
                            </Typography>

                            <CardContent className="auction-location">
                                <Typography variant="body1" color="textPrimary" component="p">
                                    {this.state.auction.Longitude !== null && this.state.auction.Latitude !== null
                                    ?
                                    "Longitude: " + this.state.auction.Longitude +
                                    "Latitude: " + this.state.auction.Latitude
                                    :
                                    null}
                                    Location: {this.state.auction.Location}
                                </Typography>
                            </CardContent>

                            <CardContent className="auction-duration">
                                <Typography variant="body1" color="textPrimary" component="p">
                                    Started: {this.state.auction.Started}
                                    Ends: {this.state.auction.Ends}
                                </Typography>
                            </CardContent>
                    </Grid>

                    <Grid item xs={2}>
                        <Paper>
                            <Typography>
                                Starting Price: {this.state.auction.First_Bid}
                            </Typography>
                            <Typography>
                                Current Price: {this.state.auction.Currently}
                            </Typography>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {this.state.auction.Buy_Price != null ? `Buyout Price: ${this.state.auction.Buy_Price}` : null}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        {position ? (
                            <Paper raised style={{width: "500px"}}>
                                <Map center={position} zoom={13} style={{height: "500px", width:"100%"}}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                    />
                                    <Marker position={position}>
                                        <Popup>{this.state.auction.Location}</Popup>
                                    </Marker>
                                </Map>
                            </Paper>) : null
                        }
                    </Grid>
                </Grid>
                
                

                
            </Paper>
        );
    }
}

function Row(props)
{
    return (
        <TableRow className={props.className} key={props.key}>
            <TableCell className="bid-cell-username">{props.username}</TableCell>
            <TableCell className="bid-cell-rating">{props.rating}</TableCell>
            <TableCell className="bid-cell-amount">{props.amount}</TableCell>
            <TableCell className="bid-cell-time">{props.time}</TableCell>
        </TableRow>
    )
}

function Head(props)
{
    return (
        <TableHead className={`table-head-${props.className}`}>
            <Row
                className={props.className}
                username={"Username"}
                rating={"Rating"}
                amount={"Amount"}
                time={"Time"}
            >
            </Row>
        </TableHead>
    )
}

function Bid(props)
{
    return (
        <Row
            className={`bid-${props.index % 2 ? "even" : "odd"}`}
            username={props.bidder.Username}
            rating={props.bidder.Rating}
            amount={props.amount}
            time={props.time}
        >
        </Row>
    )
}

class Bids extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            expanded: props.expanded
        }

        autoBind(this)
    }

    render()
    {
        console.log(this.props.content)
        return (
            <ExpansionPanel
                expanded={this.state.expanded}
                onChange={() => this.setState({expanded: !this.state.expanded})}
            >
                <ExpansionPanelSummary id={"panel"} expandIcon={<ExpandMore/>}>
                    <Table className="bids">
                        <Head className={"bids-head"}/>
                    </Table>
                </ExpansionPanelSummary>

                <ExpansionPanelDetails>
                    <Table className="bids">
                        <Head className={"bids-head"}/>
                            <TableBody className="bids-body">
                            {
                                this.props.content.map((bid, index) => {
                                    return (
                                        <Bid
                                            key={index}
                                            index={index}
                                            bidder={bid.User}
                                            amount={bid.Amount}
                                            time={bid.Time}
                                        >
                                        </Bid>
                                    )
                                })
                            }
                            </TableBody>
                    </Table>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }
}

function Images(props)
{
    const images = props.images.map( img => {
        return (
            <div className="Image" key={img.Id}>
                <CardMedia
                    className="Media"
                    image={`/api/image?path=${img.Path}`}
                />
            </div>
        )
    })

    return (
        <Carousel autoPlay={false} className="Images" indicators={false}>
            {images}
        </Carousel>
    )
}


export default withRouter(AuctionPage);

