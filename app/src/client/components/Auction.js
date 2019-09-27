import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import Carousel from './Carousel'
import { Paper, Grid, Button, ButtonGroup, Box, Dialog } from '@material-ui/core';
import { Rating } from '@material-ui/lab';
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
            auction: null,

            bidDialogOpen: false,
            buyoutDialogOpen: false,
            imageDialogOpen: false,
        };

        autoBind(this);
    }

    componentDidMount()
    {
        axios.get(`/api/auction?id=${this.state.id}`)
        .then(res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.setState({
                auction: res.data.data
            })
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

    openBidDialog()
    {
        this.setState({
            bidDialogOpen: true
        })
    }

    closeBidDialog()
    {
        this.setState({
            bidDialogOpen: false
        })
    }

    openBuyoutDialog()
    {
        this.setState({
            buyoutDialogOpen: true
        })
    }

    closeBuyoutDialog()
    {
        this.setState({
            buyoutDialogOpen: false
        })
    }

    userClick(user)
    {
        this.props.history.push(`/user/${user.Username}`);
    }

    BidDialog(props)
    {
        return (
            <Dialog open={this.state.bidDialogOpen} onClose={this.closeBidDialog}>
                Bid
            </Dialog>
        )
    }

    BuyoutDialog(props)
    {
        return (
            <Dialog open={this.state.buyoutDialogOpen} onClose={this.closeBuyoutDialog}>
                Buyout
            </Dialog>
        )
    }

    render()
    {
        const ended = this.state.auction ? (this.state.auction.has_Ended === 0 ? 0 : 1) : false;

        if (this.state.auction === null)
            return null;

        const position = this.state.auction.Latitude && this.state.auction.Longitude ? [this.state.auction.Latitude, this.state.auction.Longitude] : null;
        let rating = Math.round((this.state.auction.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;
        rating  = 3.5;

        return (
            // this.state.auction.has_Ended
            false ?
            <Paper className="AuctionPage">
                <h2>This auction has ended...</h2>
            </Paper>  
            :
            <Paper className={`AuctionPage ${ended ? "Ended" : ""}`}>
                <div className="Details">
                    <Grid container spacing={2}>
                        <Grid item xs={5} /*Images*/>
                            <Images 
                                images={this.state.auction.Images.length === 0 ? [{Id: -1, Path: "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}] : this.state.auction.Images}
                                openDialog={this.openImageDialog}
                                closeDialog={this.closeImageDialog}
                            />
                        </Grid>

                        <Grid item xs={5} /*AuctionDetails*/>
                            <CardHeader
                                className="AuctionHeader"
                                title={this.state.auction.Name}
                                subheader={
                                    <Box className="SellerBox">
                                        <Typography display="inline">by</Typography>

                                        <Typography onClick={() => {this.userClick(this.state.auction.User)}} className="Seller" display="inline" >
                                            &nbsp; {this.state.auction.User.Username}
                                        </Typography>
                                            
                                        <Rating size="small" className="Rating" display="inline" value={rating} precision={0.5} readOnly />
                                    </Box>
                                }
                            />

                            <CardContent>
                                <Typography variant="body2" color="textSecondary">
                                    {this.state.auction.Description ? this.state.auction.Description : "No Description"}
                                </Typography>
                            </CardContent>
                            

                            <CardContent className="auction-duration">
                                <Typography variant="body1" color="textPrimary" component="p">
                                    Started: {new Date(this.state.auction.Started).toDateString()}
                                </Typography>
                                <Typography variant="body1" color="textPrimary" component="p">
                                    Ends: {new Date(this.state.auction.Ends).toDateString()}
                                </Typography>
                            </CardContent>
                        </Grid>

                        <Grid item xs={2} /*Pricing*/>
                            <Paper className="Pricing" elevation={2}>
                                <h2 id="PricingTitle">Pricing</h2>
                                
                                <Grid container className="Prices" spacing={1}>
                                    <Grid item >
                                        <Typography className="Title">Starting Price:</Typography>
                                    </Grid>
                                    <Grid item >
                                        <Typography className="Starting Price" >{this.state.auction.First_Bid ? `EUR ${parseFloat(this.state.auction.First_Bid).toFixed(2)}` : "-"}</Typography>
                                    </Grid>

                                    <Grid item >
                                        <Typography className="Title">Current Price:</Typography>
                                    </Grid>
                                    <Grid item  zeroMinWidth>
                                        <Typography className="Current Price" >{this.state.auction.Currently ? `EUR ${parseFloat(this.state.auction.Currently).toFixed(2)}` : "-"}</Typography>
                                    </Grid>

                                    <Grid item >
                                        <Typography className="Title">Buyout Price:</Typography>
                                    </Grid>
                                    <Grid item >
                                        <Typography className="Buyout Price" >{this.state.auction.Buy_Price ? `EUR ${parseFloat(this.state.auction.Buy_Price).toFixed(2)}` : "-"}</Typography>
                                    </Grid>
                                </Grid>

                                <ButtonGroup className="Buttons" fullWidth color="primary" variant="contained">
                                    <Button className="Bid Button" onClick={this.openBidDialog} disabled={ended}>Bid</Button>
                                    <Button className="Buyout Button" onClick={this.openBuyoutDialog} disabled={ended}>Buyout</Button>
                                </ButtonGroup>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>

                <div className="Location">
                    <h2>Location: {this.state.auction.Location}</h2>
                    {position ? (
                        <Paper elevation={10} style={{width: "100%"}}>
                            <Map center={position} zoom={8} style={{height: "500px", width:"100%"}}>
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
                </div>

                <this.BidDialog/>
                <this.BuyoutDialog/>
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

class Images extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            openDialog: false,
            openImage: null
        }

        autoBind(this);
    }

    openDialog(imgPath)
    {
        this.setState({
            openDialog: true,
            openImage: imgPath
        })
    }

    closeDialog()
    {
        this.setState({
            openDialog: false,
            openImage: null
        })
    }

    render()
    {
        const images = this.props.images.map( img => {
            const path = `/api/image?path=${img.Path}`;

            return (
                <div className="Image" key={img.Id} onClick={() => this.openDialog(path)}>
                    <CardMedia
                        className="Media"
                        image={path}
                    />
                </div>
            )
        })
    
        return (
            <div>
                <Carousel autoPlay={false} className="Images">
                    {images}
                </Carousel>
                <Dialog open={this.state.openDialog} onClose={this.closeDialog} maxWidth={false}>
                    <img alt="Zoomed" src={this.state.openImage}/>
                </Dialog>
            </div>
        )
    }
}


export default withRouter(AuctionPage);

