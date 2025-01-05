import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import './home.scss';

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, [cookies.token]);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists, cookies.token]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  const handleKeyDown = (e, currentIndex) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % lists.length;
      handleSelectList(lists[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + lists.length) % lists.length;
      handleSelectList(lists[prevIndex].id);
    }
  };

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={list.id}
                  id={`tab-${list.id}`}
                  role="tab"
                  tabIndex={isActive ? 0 : -1} // 現在選択中のタブにのみフォーカスを設定
                  aria-selected={isActive} // 選択中のタブ
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  ref={(el) => {
                    if (isActive && el) el.focus();
                  }}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;

  const convertToLocalDate = (limit) => {
    const localDate = new Date(limit);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日${hours}時${minutes}分`;
  };

  const remainingDate = (limit) => {
    const localDate = new Date(limit);
    const today = new Date();
    const diffDays = localDate - today;
    if (diffDays > 0) {
      const diffMinutes = Math.floor(diffDays / (1000 * 60));
      const diffHours = Math.floor(Math.floor(diffMinutes / 60));
      const day = Math.floor(diffHours / 24);
      const hours = Math.floor(diffHours % 24);
      const minutes = diffMinutes % 60;
      return `${day}日${hours}時間${minutes}分`;
    } else {
      return '期日超過';
    }
  };

  if (isDoneDisplay === 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                <span>期日：</span>
                {convertToLocalDate(task.limit)}
                <br />
                {task.done ? '完了' : '未完了'}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              <span>期日：</span>
              {convertToLocalDate(task.limit)}
              <br />
              <span>残り日時：</span>
              {remainingDate(task.limit)}
              <br />
              {task.done ? '完了' : '未完了'}
            </Link>
          </li>
        ))}
    </ul>
  );
};

// props の型検証
Tasks.propTypes = {
  tasks: PropTypes.array.isRequired, // tasks は必須の配列
  selectListId: PropTypes.number.isRequired, // selectListId は必須の数値
  isDoneDisplay: PropTypes.bool.isRequired, // isDoneDisplay は必須の真偽値
};
