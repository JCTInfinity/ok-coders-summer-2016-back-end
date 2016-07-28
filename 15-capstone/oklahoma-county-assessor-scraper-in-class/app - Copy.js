var request = require('request')
var cheerio = require('cheerio')
var _ = require('lodash')
var mongoose = require('mongoose');
var accountsdb = require('./models/accounts')


var db = mongoose.connection
db.on('error', (msg) => console.log('Mongoose connection error ', msg));
db.once('open', () => console.log('Mongoose connection established'));

var minMapNumber = 1001
var maxMapNumber = 4944
var sampleMapNumber = 2713

var currentMapNumber = minMapNumber -1
var numberOfTimesCalled = 0
var currentState
var accountNumberGatherer = {}

function scrape(){
	if(currentMapNumber === maxMapNumber){
		console.log("Complete!")
	} else {
		currentMapNumber++
		console.log("Starting map #" + currentMapNumber)
		queryMapNumber(currentMapNumber, false, 1, "")
	}
}

scrape()
 // queryMapNumber(sampleMapNumber, false, 1, "")

function queryMapNumber(mapNumber, nextPage, page, state) {
  numberOfTimesCalled++
  // console.log('times called: ', numberOfTimesCalled, 'page: ', page)
  currentMapNumber = mapNumber
  var url = 'http://www.oklahomacounty.org/assessor/Searches/MapNumber.asp'
  var method = 'POST'

  if (nextPage) {
    var form = {
      fpdbr_0_PagingMove: "  >   ",
      Map: mapNumber
    }
  } else {
    console.log('done with all the numbers')
  }
}

function scrape(mapNumber) {
  var currentMapNumber
  var numberOfTimesCalled = 0
  var currentState
  var accountNumberGatherer = []

  queryMapNumber(mapNumber, false, 1, "")

  function queryMapNumber(mapNumber, nextPage, page, state) {
    numberOfTimesCalled++
    console.log('times called: ', numberOfTimesCalled, 'page: ', page)
    currentMapNumber = mapNumber
    var url = 'http://www.oklahomacounty.org/assessor/Searches/MapNumber.asp'
    var method = 'POST'

    if (nextPage) {
      var form = {
        fpdbr_0_PagingMove: "  >   ",
        Map: mapNumber
      }
    } else {
      var form = { Map: mapNumber }
    }

    if (state) {
      var headers = {
        Cookie: state
      }
    } else {
      var headers = {}
    }
    var options = {
      url: url,
      method: method,
      form: form,
      headers: headers
    }

    request(options, mapQueryCallback)
  }
}

  function mapQueryCallback(err, res, body) {
    if (err) {
      console.log('error!', err)
    } else {
      console.log('statusCode: ', res.statusCode)
      if (res.statusCode == 200) {
        if (!currentState) {
          currentState = _.replace(res.headers['set-cookie'][0], ' path=/', '')
        }
        console.log(currentState)
        gatherAccountNo(body)
      }
    }
  }

  // after getting back body from request, we pass it to this function so that
  // cheerio can pull out the links that we are interested in. It also, if there
  // is multiple pages, continues to walk those pages with subsequent requests
  function gatherAccountNo(body) {
    var $ = cheerio.load(body)
    var accountNoElements = $('a[href*="ACCOUNTNO"]')
    var accountNumbers = _.map(accountNoElements, elem => {
      return _.trim(elem.children[1].children[0].data)
    })
    accountNumberGatherer = _.union(accountNumberGatherer, accountNumbers)
    console.log(`discovered ${accountNumbers.length} account links!`)
}

function mapQueryCallback(err, res, body) {
  if (err) {
    console.log('error!', err)
  } else {
    // console.log('statusCode: ', res.statusCode)
    if (res.statusCode == 200) {
      if (!currentState) {
        currentState = _.replace(res.headers['set-cookie'][0], ' path=/', '')
      }
      // console.log(currentState)
      gatherAccountNo(body)
    }
  }
}

function gatherAccountNo(body) {
  var $ = cheerio.load(body)
  var accountNoElements = $('a[href*="ACCOUNTNO"]')
  var accountNumbers = _.map(accountNoElements, elem => {
																			return _.trim(elem.children[1].children[0].data)
																		})
	_.forEach(accountNumbers, account => {
		// console.log("test")
		var a = new accountsdb({accountNumber: account})
		a.save()  //err => console.log("Error saving! " + err.toString()))
	})
  accountNumberGatherer = _.union(accountNumberGatherer, accountNumbers)
  console.log(`discovered ${accountNumbers.length} account links!`)
  // console.log(accountNumbers)

  var currentPageInfo = pageInfo($)
  console.log("Page " + currentPageInfo.currentPage + " of " + currentPageInfo.totalPages)
  if (currentPageInfo.pagesLeft > 0) {
    queryMapNumber(currentMapNumber, true, currentPageInfo.currentPage + 1, currentState)
  } else {
    console.log('no more pages!')
	scrape()
  }
}
function pageInfo(body) {
  var pageSummary = _.trim(body('nobr').text())
  if (pageSummary) {
    var pattern = /\[(\d+)\/(\d+)\]/
    var matches = pageSummary.match(pattern)
    var currentPage = +(matches[1])
    var totalPages = +(matches[2])
  } else {
    var currentPage = 1
    var totalPages = 1
  }

    return {
      currentPage: currentPage,
      totalPages: totalPages,
      pagesLeft: totalPages - currentPage
    }
  }