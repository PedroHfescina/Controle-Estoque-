import React from "react";
import LogoImg from "../../assets/logo.svg";
import {MdDashboard, MdArrowDownward, MdArrowUpward, MdExitToApp} from 'react-icons/md'

import { Container, Header, LogImg, MenuContainer, MenuItemLink, Title, MenuItemButton } from './styles';

import { useAuth } from '../../hooks/auth';

const Aside: React.FC = () => {
  const {signOut} = useAuth();

  return (
      <Container>
            <Header>
              <LogImg src={LogoImg} alt="Logo minha carteira"/>
              <Title>Minha Carteira</Title>
            </Header>

            <MenuContainer>

                <MenuItemLink href="/">
                <MdDashboard />
                  Dashboard
                </MenuItemLink>
                <MenuItemLink href="/list/entry-balance">
                  <MdArrowUpward />
                  Entradas
                </MenuItemLink>
                <MenuItemLink href="/list/exit-balance">
                <MdArrowDownward />
                  Saídas
                </MenuItemLink>

                <MenuItemButton onClick={signOut}>
                <MdExitToApp />
                  Sair
                </MenuItemButton>

            </MenuContainer>
      </Container>

  );
}; 

export default Aside;
