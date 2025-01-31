'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface CarrinhoContextData {
  itens: ItemCarrinho[];
  adicionarItem: (item: ItemCarrinho) => void;
  removerItem: (id: string) => void;
  limparCarrinho: () => void;
  atualizarQuantidade: (id: string, quantidade: number) => void;
  total: number;
}

const CarrinhoContext = createContext<CarrinhoContextData>({} as CarrinhoContextData);

interface CarrinhoProviderProps {
  children: ReactNode;
}

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const adicionarItem = (novoItem: ItemCarrinho) => {
    setItens(prev => {
      const itemExistente = prev.find(item => item.id === novoItem.id);
      
      if (itemExistente) {
        return prev.map(item =>
          item.id === novoItem.id
            ? { ...item, quantidade: item.quantidade + novoItem.quantidade }
            : item
        );
      }

      return [...prev, novoItem];
    });
  };

  const removerItem = (id: string) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  const limparCarrinho = () => {
    setItens([]);
  };

  const atualizarQuantidade = (id: string, quantidade: number) => {
    setItens(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantidade } : item
      )
    );
  };

  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        limparCarrinho,
        atualizarQuantidade,
        total
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  }
  return context;
}; 