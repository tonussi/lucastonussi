'use client'

import { TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A simple area chart'

const chartData = [
  { month: 'January', orders: 186 },
  { month: 'February', orders: 305 },
  { month: 'March', orders: 237 },
  { month: 'April', orders: 73 },
  { month: 'May', orders: 209 },
  { month: 'June', orders: 214 },
]

const chartConfig = {
  orders: {
    label: 'Orders',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function MonitorSellsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders monitor</CardTitle>
        <CardDescription>Showing total orders for the last days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="orders"
              type="natural"
              fill="var(--color-primary)"
              fillOpacity={0.4}
              stroke="var(--color-secondary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
