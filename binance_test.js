///<reference types="Cypress"/>

describe('Write end-to-end tests for Binance website', function () {
    beforeEach(()=> {
        cy.visit("https://www.binance.com/en") //Starts on the landing page
    })
    function pairTradingScreen(scr='ETH'){  //open the pair trading screen by clicking on the screen button (default to the ETH screen, otherwise user can define scr)
        cy.log("Opening pair trading screen for: " + scr)
        return cy.contains(scr).click({ force: true })  //I could simply scroll to the bottom to get rid of the overlay, but that's annoying and unnecessary
    }
    
    it('First end-to-end test', function () {
        //Clicks the ETH/BTC button leading to Pair trading view
        pairTradingScreen().then(() => { //Occassionally an overlay can appear and block access to the button
            //Verifies that all important information is loaded, e.g.trading chart, limit, market, stop limit input boxes, etc. (leaving this purposefully open to see what you think makes sense to test
            //Since we do not control the client code, it's difficult to consistently get the correct dom container that we want to get.  In order to fully utilize cypress, decorators need to be added
            //to ensure cypress compatibility.  The following are tests of dom containers that seem to be consistent
            cy.get('.h0o2f9-0').contains('ETH')
            cy.get('.h0o2f9-4').contains('Ethereum')
            cy.get(':nth-child(1) > .sc-1p4en3j-2').contains('Last Price')
            //Here's a way to test if a container contains numeric data.  Right now, the page loads the dom containers with random numbers, so this code doesn't always work.
            //If I could get the dom container, this is how I would check for numeric values.  Here we need a decorator to get consistent playbacks
            //cy.get('.sc-1p4en3j-6').contains(/[0-9]/)
            //cy.get('.sc-1p4en3j-7 > span').contains(/[0-9]/)
            //cy.get('.sc-1d711xa-1 > :nth-child(1)').should(LastPrice => {
            //})
            cy.get(':nth-child(2) > .sc-1p4en3j-2').contains('24h Change')
            cy.get(':nth-child(3) > .sc-1p4en3j-2').contains('24h High')
            cy.get(':nth-child(4) > .sc-1p4en3j-2').contains('24h Low')
            cy.get(':nth-child(5) > .sc-1p4en3j-2').contains('24h Volume')
        })
    })
    
    it('Second end-to-end test', function () {
        var user_price = '1234'
        var user_quantity = '1'
        pairTradingScreen().then(() => {    //Start on the Pair trading view
            cy.log("Checking buy price input for:" + user_price)
            cy.get('#FormRow-BUY-price')
                .clear().type(user_price) //Enters some valid values into the Buy ETH form
                .should('have.value', user_price)
            cy.log("Checking buy price quantity for:" + user_quantity)
            cy.get('#FormRow-BUY-quantity')
                .clear().type(user_quantity)
                .should('have.value', user_quantity)
            cy.log("Checking total price calculation" )
            cy.get('#FormRow-BUY-total').should(total => { //Make sure the Total field has the correct value(Total = price * Amount)
                var base = parseFloat(total.attr('value')).toFixed(2)
                var compare = parseFloat(user_price * user_quantity).toFixed(2)
                expect(base).to.equal(compare)
            })
            cy.log("Verifies that you can't submit the form since you are not logged in")
            cy.get(':nth-child(1) > .sc-1lt5gnu-0 >').should(login_objs => {
                expect(login_objs).to.have.length(8)
                expect(login_objs[6].innerText).to.contain('Log In or Register to trade') //Verifies that you can't submit the form since you are not logged in
            })
                
        })
    })
    it('Write a data last end - to - end(WebSockets)', function () {
        cy.log("Verify response to the web request and a constant stream of data is being received")
        cy.request('https://www.binance.com/en/trade/ETH_BTC').should((response) => {  //Starts on the Pair trading view and use WebSockets to fetch tickers
            expect(response.status).to.eq(200)  //Verifies that the data is loaded in the tickers.  A status of 200 indicates a successful data request
            expect(response).to.have.property('headers')
            expect(response).to.have.property('body')  //Verifies there is a consistent stream of data.
            expect(response.body).to.contain('minQty') //Verify the stream (body) has a 'minQty' field in the stream.  This could be any valid field.
            expect(response.duration).lessThan(1000)  //Verifies the time it takes the socket connection to connect is less than 1 second
        })
    })
})
