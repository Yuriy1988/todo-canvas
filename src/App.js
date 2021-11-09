import {useState, Component, createRef, useEffect } from "react";
import { isEmpty } from "ramda";
import shortid from 'shortid';
import SignaturePad from 'react-signature-canvas';

import styles from './App.css';

const ITEM_STATE = {
    PLANNED: 'PLANNED',
    FINISHED: 'FINISHED',
    IN_PROGRESS: 'IN_PROGRESS',
}

class Canvas extends Component {
    canvasContainerRef = createRef();

    componentDidMount() {
        if (!isEmpty(this.props.data)) {
            console.log('this.props.data', this.props.data);
            this.fulfill(this.props.data);
        }
    }

    onEnd = () => {
        const canvas = this.canvasContainerRef.current;
        this.props.saveData({ id: this.props.id, data: canvas.toData()})
    }

    fulfill = (data) => {
        const canvas = this.canvasContainerRef.current;
        canvas.fromData(data);
    };

    render () {
        return <div className={'container'}>
            <div className={'sigContainer'}>
                <SignaturePad
                    ref={this.canvasContainerRef}
                    onEnd={this.onEnd}
                    canvasProps={{ className: 'sigPad' }}
                />
            </div>
        </div>
    }
}

const ToDoItem = (props) => {
    return (
        <div style={{ border: '1px solid black' }}>
            <button onClick={props.deleteItem}>Delete</button>
            <button onClick={() => props.changeState(ITEM_STATE.PLANNED)}>Set planned</button>
            <button onClick={() => props.changeState(ITEM_STATE.FINISHED)}>Set Finished</button>
            <button onClick={() => props.changeState(ITEM_STATE.IN_PROGRESS)}>Set In Progress</button>
            <div>{props.state}</div>
            <Canvas id={props.id} data={props.data} saveData={props.saveData} />
        </div>
    )
}


const App = () => {
    const [todoList, updateList] = useState([]);

    const saveToStorage = (updatedList) => {
        localStorage.setItem('todolist', JSON.stringify(updatedList));
    };

    const addToDoItem = () => {
        const id = shortid.generate();
        const item = { id, data: {}, state: ITEM_STATE.PLANNED};
        const updatedList = todoList.concat(item)

        updateList(updatedList);
        saveToStorage(updatedList);
    };

    const changeState = ({ id, state }) => {
        const updatedList = todoList.map((item) => {
            return item.id === id ? { ...item, state } : item;
        });

        updateList(updatedList);
        saveToStorage(updatedList);
    };

    const deleteItem = ({ id }) => {
        const updatedList = todoList.reduce((acc,item) => {
            return item.id === id ? acc : acc.concat(item);
        }, []);

        updateList(updatedList);
        saveToStorage(updatedList);
    };

    const saveData = ({ id, data }) => {
        const updatedList = todoList.map((item) => {
            return item.id === id ? { ...item, data } : item;
        });

        updateList(updatedList);
        saveToStorage(updatedList);
    };

    const restoreFromLocalStorage = () => {
        const todolist = localStorage.getItem('todolist');

        if (todolist) {
            updateList(JSON.parse(todolist));
        }
    };

    useEffect(() => {
        restoreFromLocalStorage();
    }, []);

  return (
      <div>
          <button onClick={addToDoItem}>Add Item</button>
          {
              todoList.map(item => (
                <ToDoItem
                    key={item.id}
                    id={item.id}
                    state={item.state}
                    data={item.data}
                    saveData={saveData}
                    deleteItem={() => deleteItem({ id: item.id })}
                    changeState={(state) => changeState({ id: item.id, state })}
                />
              ))
          }
      </div>
  )
};

export default App;
