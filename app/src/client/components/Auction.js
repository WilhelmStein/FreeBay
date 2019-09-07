import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import { List, ListItem, ListItemText, IconButton } from '@material-ui/core';
import { GridList, GridListTile } from '@material-ui/core'
import { Avatar } from '@material-ui/core';
import { Paper } from '@material-ui/core';
import { Card, CardHeader, CardMedia, CardContent, CardActions } from '@material-ui/core';
import { Typography, Collapse } from '@material-ui/core'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

import { Container } from '@material-ui/core'
import AwesomeSlider from 'react-awesome-slider';
import AwsSliderStyles from 'react-awesome-slider/src/styles';

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
                <img src={url}></img>
            </div>
        );
    }

    render()
    {
        if (this.state.auction === null)
            return null;

        return (
            <Paper>
                <Card className="AuctionPage">
                    <CardHeader
                        title={this.state.auction.Name}
                        subheader={`${this.state.auction.User.Username} - ${this.state.auction.User.Rating}`}
                    >
                    </CardHeader>
                    <Images images={this.state.auction.Images}></Images>
                    <CardContent className="auction-money">
                        <Typography variant="body1" color="textPrimary" component="p">
                            {this.state.auction.Buy_Price != null ? "Buy Price: " + this.state.auction.Buy_Price : null}
                            First Bid: {this.state.auction.First_Bid}
                            Currently: {this.state.auction.Currently}
                        </Typography>
                    </CardContent>
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
                    <Typography variant="body2" color="textSecondary" component="p">
                        {this.state.auction.Description}
                    </Typography>
                    <Bids
                        content={this.state.auction.Bids}
                        expanded={false}
                    >
                    </Bids>
                </Card>
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
            content: props.content,
            expanded: props.expanded
        }

        autoBind(this)
    }

    render()
    {
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
                                this.state.content.map((bid, index) => {
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

class Images extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            images: props.images
        }
    }

    render()
    {
        // const images = this.state.images.map(
        //     image => <div data-src={`/api/image?path=${image.Path}`}/>
        // )

        const images = [
            "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image",
            "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image",
            "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image",
            "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"
        ].map( (image, index) => <div key={index} data-src={image}/>)

        return (
            <Container maxWidth="sm">
                {(images.length !== 0
                ?
                <AwesomeSlider cssModule={AwsSliderStyles}>
                    {images}
                </AwesomeSlider>
                :
                <Card>
                    <CardMedia
                        className="no-image-card"
                        image={"https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                    />
                </Card>)}
            </Container>
        )
    }
}

export default withRouter(AuctionPage);

