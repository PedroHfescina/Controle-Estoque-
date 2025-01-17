import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import ContentHeader from "../../components/ContentHeader";
import SelectInput from "../../components/SelectInput";
import HistoryFinanceCard from "../../components/HistoryFinanceCard";

import gains from '../../repositories/gains';
import expenses from '../../repositories/expenses';
import formatCurrency from "../../utils/formatCurrency";
import formatDate from '../../utils/formatDate';
import listOfMonths from '../../utils/months';

import { Container, Content, Filters } from "./styles";

interface RouteParams {
  [key: string]: string | undefined;
  type: string;
}

interface IData {
  id: string;
  description: string;
  amountFormatted: string;
  frequency: string;
  dateFormatted: string;
  tagColor: string;
}

const List: React.FC = () => {
  const [data, setData] = useState<IData[]>([]);
  const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1);
  const [yearSelected, setYearSelected] = useState<number>(); // Inicializamos vazio e ajustamos depois.
  const [frequencyFilterSelected, setFrequencyFilterSelected] = useState(['recorrente', 'eventual']);

  const { type } = useParams<RouteParams>();

  const pageData = useMemo(() => {

    return type === 'entry-balance' ?
      {
        title: 'Entradas',
        lineColor: '#F7931B',
        data: gains
      }
    :
      {
        title: 'Saída',
        lineColor: '#E44C4E',
        data: expenses
      }
},[type]);


  const years = useMemo(() => {
    const uniqueYears: number[] = [];

    const {data} = pageData;

    data.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      if (!uniqueYears.includes(year)) {
        uniqueYears.push(year);
      }
    });
    return uniqueYears.map((year) => ({
      value: year,
      label: year,
    }));
  }, [pageData]);


  const months = useMemo(() => {
    return listOfMonths.map((month, index) => ({
      value: index + 1,
      label: month,
    }));
  }, []);

  
  const handleMonthSelected = (month: string) => {
    try{
      const parseMonth = Number(month);
      setMonthSelected(parseMonth)
    }
    catch(error){
      throw new Error('Invalid month value')
    }
  }


  const handleYearSelected = (year: string) => {
    try{
      const parseYear = Number(year);
      setYearSelected(parseYear)
    }
    catch(error){
      throw new Error('Invalid year value')
    }
  }





  // Movido a lógica do estado selecionado da frequência para fora do hook useEffect
  const handleFrequencyClick = (frequency: string) => {
    const alreadySelected = frequencyFilterSelected.findIndex(item => item === frequency);

    if (alreadySelected >= 0) {
      const filtered = frequencyFilterSelected.filter(item => item !== frequency);
      setFrequencyFilterSelected(filtered);
    } else {
      setFrequencyFilterSelected((prev) => [...prev, frequency]);
    }
  };

  // Ajustamos o estado de `yearSelected` na primeira renderização.
  useEffect(() => {
    if (!yearSelected && years.length > 0) {
      setYearSelected((years[0].value)); // Seleciona o primeiro ano disponível
    }
  }, [years, yearSelected]);

  useEffect(() => {
    // Filtrando os dados com base no mês e ano selecionados

    const {data} = pageData;

    const filteredData = data.filter((item) => {
      const date = new Date(item.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return month === monthSelected && year === yearSelected && frequencyFilterSelected.includes(item.frequency);
    });

    // Formatando os dados
    const formattedData = filteredData.map((item) => ({
      id: String(new Date().getTime()) + item.amount,
      description: item.description,
      amountFormatted: formatCurrency(Number(item.amount)),
      frequency: item.frequency,
      dateFormatted: formatDate(item.date),
      tagColor: item.frequency === "recorrente" ? "#4E41F0" : "#E44C4E",
    }));

    setData(formattedData); // Atualizando o estado com os dados formatados
  }, [pageData ,monthSelected, yearSelected, frequencyFilterSelected]);

  return (
    <Container>
      <ContentHeader title={pageData.title} lineColor={pageData.lineColor}>
        <SelectInput
          options={months}
          onChange={(e) => handleMonthSelected(e.target.value)}
          defaultValue={monthSelected}
        />
        <SelectInput
          options={years}
          onChange={(e) => handleYearSelected(e.target.value)}
          defaultValue={yearSelected}
        />
      </ContentHeader>

      <Filters>
        <button 
          type="button" 
          className={`tag-filter tag-filter-recurrent 
            ${frequencyFilterSelected.includes('recorrente') && 'tag-actived' }`}
          onClick={() => handleFrequencyClick('recorrente')}
        >
          Recorrentes
        </button>
        <button 
          type="button" 
          className={`tag-filter tag-filter-eventual
            ${frequencyFilterSelected.includes('eventual') && 'tag-actived' }`}
          onClick={() => handleFrequencyClick('eventual')}
        >
          Eventuais
        </button>
      </Filters>

      <Content>
        {data.length > 0 ? (
          data.map((item) => (
            <HistoryFinanceCard
              key={item.id}
              tagColor={item.tagColor}
              title={item.description}
              subtitle={item.dateFormatted}
              amount={item.amountFormatted}
            />
          ))
        ) : (
          <p>Nenhum dado encontrado.</p>
        )}
      </Content>
    </Container>
  );
};

export default List;
