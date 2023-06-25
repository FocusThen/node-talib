import express from 'express'
import yf from 'yahoo-finance'
import { createRequire } from 'module'
const talib = createRequire(import.meta.url)('talib')

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  console.log('getting data')

  const symbol = 'ADX'

  yf.historical(
    {
      symbol: symbol,
      from: '2020-01-01',
      to: '2020-08-01',
    },
    (err, data) => {
      const yfData = data.reduce(
        (current, next) => {
          current.open.push(next.open)
          current.high.push(next.high)
          current.low.push(next.low)
          current.close.push(next.close)
          current.volume.push(next.volume)
          return current
        },
        {
          open: [],
          high: [],
          low: [],
          close: [],
          volume: [],
        }
      )

      talib.execute(
        {
          name: symbol,
          startIdx: 0,
          endIdx: yfData.close.length - 1,
          open: yfData.open,
          high: yfData.high,
          low: yfData.low,
          close: yfData.close,
          volume: yfData.volume,
          optInTimePeriod: 9,
        },
        (err, result) => {
          console.log(err, result)
          return res.json({
            yahoo: yfData,
            talib: result,
          })
        }
      )
    }
  )
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
