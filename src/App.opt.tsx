import React from "react";

interface IStateContext {
  beer: number;
  honey: number;
  addBeer: () => void;
  addHoney: () => void;
}
interface IStateConsumerProps<Context, Value> {
  context: React.Context<Context>;
  selector: (context: Context) => Value;
  children: (value: Value) => React.ReactNode;

  name?: string;
}
const defaultValue: IStateContext = {
  beer: 0,
  honey: 0,
  addBeer: () => {},
  addHoney: () => {}
};

const StateContext = React.createContext(defaultValue);

const StateConsumerChild: React.FC<{
  children: React.ReactNode;
  name?: string;
}> = ({ children, name }) => {
  if (name) console.debug(`${name}: StateConsumerChild.render`);
  React.useEffect(() => {
    if (!name) return;
    console.debug(`${name}: children changed`);
  }, [children]);
  return <>{children}</>;
};
const MemoizedStateConsumerChild = React.memo(StateConsumerChild);

function StateConsumer<Context, Value>({
  context,
  selector,
  children,
  name
}: IStateConsumerProps<Context, Value>) {
  const contextObj = React.useContext(context);
  const selection = React.useMemo(() => selector(contextObj), [
    selector,
    contextObj
  ]);

  React.useEffect(() => {
    if (!name) return;
    console.debug(`${name}: selector changed`);
  }, [selector, name]);

  React.useEffect(() => {
    if (!name) return;
    console.debug(`${name}: context changed`);
  }, [context, name]);

  React.useEffect(() => {
    if (!name) return;
    console.debug(`${name}: selection changed`);
  }, [selection, name]);

  React.useEffect(() => {
    if (!name) return;
    console.debug(`${name}: contextObj changed`);
  }, [contextObj, name]);

  // const contextObj = React.useContext(context);
  return (
    <MemoizedStateConsumerChild name={name}>
      {children(selection)}
    </MemoizedStateConsumerChild>
  );
}

const Beer: React.FC = () => {
  console.debug("Beer.render");
  const renderBeer = React.useCallback((value: number) => {
    // console.debug(`beers.render ${value}`);
    return <button>{`beers: ${value}`}</button>;
  }, []);

  const beerSelector = React.useCallback(({ beer }: IStateContext) => beer, []);

  return (
    <>
      <StateConsumer name="beer" context={StateContext} selector={beerSelector}>
        {renderBeer}
      </StateConsumer>
    </>
  );
};

const Honey: React.FC = () => {
  console.debug("Honey.render");
  return (
    <StateConsumer
      context={StateContext}
      selector={({ honey, addHoney }) => ({
        honey,
        addHoney
      })}
    >
      {(value: any) => {
        console.debug("honey.render");
        return (
          <button onClick={value.addHoney}>{`honey: ${value.honey}`}</button>
        );
      }}
    </StateConsumer>
  );
};

const Component: React.FC = () => {
  return (
    <>
      <Beer />
      <Honey />
    </>
  );
};
const MemoizedComponent = React.memo(Component);

const App: React.FC = () => {
  console.debug("App.render");
  const [beer, addBeer] = React.useReducer((state) => state + 1, 0);
  const [honey, addHoney] = React.useReducer((state) => state + 1, 0);

  const stateContext = React.useMemo<IStateContext>(
    () => ({
      beer,
      honey,
      addBeer,
      addHoney
    }),
    [beer, honey]
  );

  return (
    <StateContext.Provider value={stateContext}>
      <MemoizedComponent />
    </StateContext.Provider>
  );
};

export default App;
