import React from "react";
import "./style.scss";
import axios from 'axios';
import API from '../../api/links';
import profileImage from './profile.svg';
import GooglePayButton from '@google-pay/button-react';
import strings from "../../locale/locale"


const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: null
        }
    }

    uploadImage(img) {
        const API_KEY = process.env.REACT_APP_API_KEY;

        let body = new FormData();
        body.set('key', API_KEY);
        body.append('image', img);

        return axios({
            method: 'post',
            url: 'https://api.imgbb.com/1/upload',
            data: body
        })
    }

    handleSubmit = e => {
        e.preventDefault();

        if (e.target[1].files.length) {
            this.uploadImage(e.target[1].files[0])
                .then(response => {
                    axios.put(API.profile, { image: response.data.data.url }, { headers });
                })
        }

        if (this.state.username) {
            axios.put(API.profile, { name: this.state.username }, { headers });
        }

        if (e.target[1].files.length || this.state.username) {
            setTimeout(() => { window.location.reload(); }, 2000);
        }
    }

    handleChange = e => {
        e.preventDefault();
        const { name, value } = e.target;

        this.setState({ [name]: value });
    };

    render() {
        return (
            <div className="profile">
                <div className="wrapper">
                    <div className="row">
                        <div className="col">
                            <div className="header">{strings.profile}</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="content">
                            <form className="form" onSubmit={this.handleSubmit}>
                                <div className="row mx-4 my-3">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="username">{strings.username}</label>
                                            <input type="text" name="username" id="username" placeholder="Username" onChange={this.handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="image">{strings.image}</label>
                                            <input type="file" name="image" id="image" />
                                        </div>
                                        {!this.props.user.premium ?
                                            <div className="form-group mt-4">
                                                <label htmlFor="premium">Premium - 10$</label>
                                                <GooglePayButton
                                                    environment="TEST"
                                                    paymentRequest={{
                                                        apiVersion: 2,
                                                        apiVersionMinor: 0,
                                                        allowedPaymentMethods: [
                                                            {
                                                                type: 'CARD',
                                                                parameters: {
                                                                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                                                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                                                },
                                                                tokenizationSpecification: {
                                                                    type: 'PAYMENT_GATEWAY',
                                                                    parameters: {
                                                                        gateway: 'example',
                                                                        gatewayMerchantId: 'exampleGatewayMerchantId',
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                        merchantInfo: {
                                                            merchantId: '12345678901234567890',
                                                            merchantName: 'Demo Merchant',
                                                        },
                                                        transactionInfo: {
                                                            totalPriceStatus: 'FINAL',
                                                            totalPriceLabel: 'Total',
                                                            totalPrice: '10.00',
                                                            currencyCode: 'USD',
                                                            countryCode: 'US',
                                                        },
                                                    }}
                                                    onLoadPaymentData={paymentRequest => {
                                                        axios.put(API.profile, { premium: paymentRequest.paymentMethodData.tokenizationData.token }, { headers });
                                                        window.location.reload();
                                                    }}
                                                />
                                            </div>
                                            :
                                            <div className="form-group mt-4">
                                                <label htmlFor="premium"><i class="fa fa-star" style={{ 'color': '#F7D00E' }}></i> Premium <i class="fa fa-star" style={{ 'color': '#F7D00E' }}></i></label>
                                            </div>
                                        }
                                    </div>
                                    <div className="col-6">
                                        <div className="image">
                                            <img src={profileImage} alt="register_image" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <div className="footer">
                                            <button type="submit" className="button">{strings.submit}</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
