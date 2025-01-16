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
  type?: string; // 'type' é opcional
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
  const [monthSelected, setMonthSelected] = useState<string>(String(new Date().getMonth() + 1));
  const [yearSelected, setYearSelected] = useState<string>(""); // Inicializamos vazio e ajustamos depois.
  const [selectedFrequency, setSelectedFrequency] = useState(['recorrente', 'eventual']);

  const { type } = useParams<RouteParams>();

  const title = useMemo(() => {
    return type === "entry-balance" ? "Entradas" : "Saída";
  }, [type]);

  const lineColor = useMemo(() => {
    return type === "entry-balance" ? "#F7931B" : "#E44C4E";
  }, [type]);

  const listData = useMemo(() => {
    return type === "entry-balance" ? gains : expenses;
  }, [type]);

  const years = useMemo(() => {
    const uniqueYears: number[] = [];
    listData.forEach((item) => {
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
  }, [listData]);

  const months = useMemo(() => {
    return listOfMonths.map((month, index) => ({
      value: index + 1,
      label: month,
    }));
  }, []);

  // Movido a lógica do estado selecionado da frequência para fora do hook useEffect
  const handleFrequencyClick = (frequency: string) => {
    const alreadySelected = selectedFrequency.findIndex(item => item === frequency);
    if (alreadySelected >= 0) {
      const filtered = selectedFrequency.filter(item => item !== frequency);
      setSelectedFrequency(filtered);
    } else {
      setSelectedFrequency((prev) => [...prev, frequency]);
    }
  };

  // Ajustamos o estado de `yearSelected` na primeira renderização.
  useEffect(() => {
    if (!yearSelected && years.length > 0) {
      setYearSelected(String(years[0].value)); // Seleciona o primeiro ano disponível
    }
  }, [years, yearSelected]);

  useEffect(() => {
    // Filtrando os dados com base no mês e ano selecionados
    const filteredData = listData.filter((item) => {
      const date = new Date(item.date);
      const month = String(date.getMonth() + 1);
      const year = String(date.getFullYear());

      return month === monthSelected && year === yearSelected && selectedFrequency.includes(item.frequency);
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
  }, [listData, monthSelected, yearSelected, selectedFrequency]);

  return (
    <Container>
      <ContentHeader title={title} lineColor={lineColor}>
        <SelectInput
          options={months}
          onChange={(e) => setMonthSelected(e.target.value)}
          defaultValue={monthSelected}
        />
        <SelectInput
          options={years}
          onChange={(e) => setYearSelected(e.target.value)}
          defaultValue={yearSelected}
        />
      </ContentHeader>

      <Filters>
        <button 
          type="button" 
          className={`tag-filter tag-filter-recurrent 
            ${selectedFrequency.includes('recorrente') && 'tag-actived' }`}
          onClick={() => handleFrequencyClick('recorrente')}
        >
          Recorrentes
        </button>
        <button 
          type="button" 
          className={`tag-filter tag-filter-eventual
            ${selectedFrequency.includes('eventual') && 'tag-actived' }`}
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
