import { View, Text } from 'react-native'
import React from 'react'
import { getEventsForDate } from './filtercalenderDate'

export default function AddToCalendar({ bookingList }) {

    // Safely convert GMT string → YYYY-MM-DD
    const formatToYYYYMMDD = (gmtString) => {
        if (!gmtString) return null
        const timestamp = Date.parse(gmtString)
        if (isNaN(timestamp)) return null
        const date = new Date(timestamp)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Generate all dates between start and end
    const getDatesBetween = (startGMT, endGMT) => {
        const dates = []
        let currentDate = new Date(Date.parse(startGMT))
        const endDate = new Date(Date.parse(endGMT))

        while (currentDate <= endDate) {
            const year = currentDate.getUTCFullYear()
            const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
            const day = String(currentDate.getUTCDate()).padStart(2, '0')
            dates.push(`${year}-${month}-${day}`)
            currentDate.setUTCDate(currentDate.getUTCDate() + 1)
        }
        return dates
    }

    // Format data
    // const filteredData =
    //     Array.isArray(bookingList) &&
    //     bookingList.map(event => ({
    //         end_date: event.end_date,
    //         id: event.id,
    //         start_date: event.start_date,
    //         title: event.title,
    //         occusr_type: event.occusr_type,
    //         occusr_month: event.occusr_month,
    //         occusr_weekday: event.occusr_weekday,
    //     }))

    // const filteredData = [{"end_date": "2026-05-07T00:00:00", "id": 445, "occusr_month": 0, "occusr_type": 3, "occusr_weekday": "2", "start_date": "2025-07-09T00:00:00", "title": "1 year every wednsday"}]
    const filteredData = [{ "end_date": "2025-11-22T00:00:00", "id": 244, "occusr_month": 2, "occusr_type": 4, "occusr_weekday": "", "start_date": "2025-05-22T00:00:00", "title": "fffff" }]
    // const filteredData = [{"end_date": "2025-07-29T00:00:00", "id": 226, "occusr_month": 0, "occusr_type": 2, "occusr_weekday": "", "start_date": "2025-04-29T00:00:00", "title": "HHEHHEHHE NENNW 0000999"}]

    console.log(filteredData, 'filteredData');
    return (
        <View>
            {filteredData?.map((item, index) => {
                const allDates = getDatesBetween(item.start_date, item.end_date)

                return (
                    <View key={index} style={{ marginBottom: 10 }}>
                        <Text>{item?.title}</Text>
                        <Text>{item?.start_date} → {item?.end_date}</Text>
                        <Text>occusr_type: {item?.occusr_type}</Text>

                        {allDates.map((date, i) => (
                            <View key={i}>
                                <Text>{date}</Text>
                                <Text>
                                    {JSON.stringify(getEventsForDate(filteredData, date))}
                                </Text>
                            </View>
                        ))}
                    </View>
                )
            })}
        </View>
    )
}
