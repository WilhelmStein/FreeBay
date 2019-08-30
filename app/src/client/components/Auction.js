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
                <Card className="auction-page">
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
        const content = this.state.content.map((bid, index) =>
            <TableRow className={`bid-${index % 2 ? "even" : "odd"}`} key={bid.Id}>
                <TableCell>{bid.User.Username}></TableCell>
                <TableCell>{bid.User.Rating}></TableCell>
                <TableCell>{bid.Amount}></TableCell>
                <TableCell>{bid.Time}></TableCell>
            </TableRow>
        )

        return (
            <Table size="large" className="bids">
                <ExpansionPanel
                    expanded={this.state.expanded}
                    onChange={() => this.setState({expanded: !this.state.expanded})}
                >
                    <ExpansionPanelSummary
                        id={"bids-expandable-header"}
                        expandIcon={<ExpandMore/>}
                    >
                        <TableHead className="bids-head">
                            <TableRow>
                                <TableCell>{"Username"}></TableCell>
                                <TableCell>{"Rating"}></TableCell>
                                <TableCell>{"Amount"}></TableCell>
                                <TableCell>{"Time"}></TableCell>
                            </TableRow>
                        </TableHead>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <TableBody className="bids-body">
                            {content}
                        </TableBody>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Table>
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
        ].map(image => <div data-src={image}/>)

        return (
            <Container maxWidth={"ms"}>
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

