import React from 'react';
import Card from './Card';
import CardBody from './CardBody';

const MetricCard = ({ title, value, icon }) => {
  return (
    <Card>
      <CardBody className="flex flex-col items-center justify-center text-center h-full">
        {icon}
        <p className="text-3xl font-bold text-zinc-800 dark:text-white">{value}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
      </CardBody>
    </Card>
  )
}

export default MetricCard;