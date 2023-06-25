import express from 'express'
import yf from 'yahoo-finance'
import { createRequire } from 'module'
const talib = createRequire(import.meta.url)('talib')

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const symbol = 'ADX'

  try {
    const yfData = await yf
      .historical({
        symbol: symbol,
        from: '2020-01-01',
        to: '2020-08-01',
      })
      ?.reduce(
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

    try {
      const talibData = await talib.execute({
        name: symbol,
        startIdx: 0,
        endIdx: yfData.close.length - 1,
        open: yfData.open,
        high: yfData.high,
        low: yfData.low,
        close: yfData.close,
        volume: yfData.volume,
        optInTimePeriod: 9,
      })

      await res.json({
        yahoo: yfData,
        talib: talibData,
      })
    } catch (reson) {
      res.statusCode = 400
      res.send(reson)
    }
  } catch (reson) {
    res.statusCode = 400
    res.send(reson)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
