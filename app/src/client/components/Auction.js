import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import { List, ListItem, ListItemText, IconButton } from '@material-ui/core';
import { GridList, GridListTile } from '@material-ui/core'
import { Avatar } from '@material-ui/core';
import { Paper } from '@material-ui/core';
import { Card, CardHeader, CardMedia, CardContent, CardActions } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons'
import { Typography, Collapse } from '@material-ui/core'

class AuctionPage extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            id: props.match.params.id,
            expanded: false,
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
                        avatar={
                            <Avatar
                                aria-label="auction-avatar"
                                className="auction-avatar"
                                src={this.state.auction.Images.length !== 0 ? `/api/image?path=${this.state.auction.Images[0]}` : "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                            >
                            </Avatar>
                        }
                        title={this.state.auction.Name}
                        subheader={`${this.state.auction.User.Username} - ${this.state.auction.User.Rating}`}
                    >
                    </CardHeader>
                    <CardMedia
                        className="auction-first-image"
                        image={this.state.auction.Images.length !== 0 ? `/api/image?path=${this.state.auction.Images[0]}` : "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                        title={this.state.auction.Name}
                    />
                    <GridList
                        className="auction-images"
                        cellHeight={160}
                        cols={3}
                    >
                        {this.state.auction.Images.map(image =>
                            <GridListTile key={image.Path}>
                                <img src={image.Path}/>
                            </GridListTile>
                        )}
                    </GridList>
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
                    <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {this.state.auction.Description}
                        </Typography>
                    </Collapse>
                    <CardActions disableSpacing>
                        <IconButton className='auction-description-expand'
                            onClick={() => { this.setState({expanded: !this.state.expanded})}}
                            aria-expanded={this.state.expanded}
                            aria-label={"Show More"}
                        >
                            <ExpandMore/>
                        </IconButton>
                    </CardActions>
                    <CardContent className="auction-bids">
                    {(this.state.auction.Bids.length !== 0
                    ?
                    (
                        <List component="div">
                            {this.state.auction.Bids.map(bid =>
                                <Bid
                                    Id={bid.Id}
                                    Username={bid.User.Username}
                                    Rating={bid.User.Rating}
                                    Amount={bid.Amount}
                                    Time={bid.Time}
                                >
                                </Bid>
                            )}
                        </List>
                    )
                    :
                    null
                    )}
                    </CardContent>
                </Card>
            </Paper>
            //     <div className="auction-description">
            //         <h4>{this.state.auction.Description}</h4>
            //     </div>
        );
    }
}

function Bid(props)
{
    return (
        <ListItem key={props.Id}>
            <Avatar className="auction-avatar">{props.Username[0]}</Avatar>
            <ListItemText
                primary={`${props.Username} ${props.Rating}`}
                secondary={`Amount: ${props.Amount} Time: ${props.Time}`}>
            </ListItemText>
        </ListItem>
    )
}

export default withRouter(AuctionPage);

