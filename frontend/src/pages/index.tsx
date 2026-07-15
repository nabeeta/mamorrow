'use client'

import { useEffect, useMemo, useState } from 'react'

type Importance = 'red' | 'orange' | 'yellow' | 'green' | 'blue'

type Task = {
  id: number
  importance: Importance
  deadline: string
  scheduledDate: string
  taskName: string
  requester: string
  media: string
  registeredDate: string
  memo: string
  completed: boolean
}

const initialTasks: Task[] = [
  {
    id: 1,
    importance: 'red',
    deadline: '2026-06-25T10:00',
    scheduledDate: '2026-06-24',
    taskName: '見積書の提出',
    requester: '営業部 田中',
    media: 'メール',
    registeredDate: '2026-06-20',
    memo: '添付ファイルあり',
    completed: false,
  },
  {
    id: 2,
    importance: 'orange',
    deadline: '2026-06-25T15:00',
    scheduledDate: '2026-06-25',
    taskName: '定例会議の資料作成',
    requester: '上司 佐藤',
    media: 'Teams',
    registeredDate: '2026-06-21',
    memo: '前回資料を参考',
    completed: false,
  },
  {
    id: 3,
    importance: 'yellow',
    deadline: '2026-06-26T09:00',
    scheduledDate: '2026-06-26',
    taskName: '顧客への返信',
    requester: '顧客A社',
    media: 'メール',
    registeredDate: '2026-06-22',
    memo: 'クレーム対応含む',
    completed: false,
  },
  {
    id: 4,
    importance: 'green',
    deadline: '2026-06-26T18:00',
    scheduledDate: '2026-06-27',
    taskName: '経費精算の入力',
    requester: '経理部',
    media: 'その他',
    registeredDate: '2026-06-23',
    memo: 'レシート写真必要',
    completed: false,
  },
  {
    id: 5,
    importance: 'blue',
    deadline: '2026-06-27T12:00',
    scheduledDate: '2026-06-27',
    taskName: 'プロジェクト進捗報告',
    requester: 'PM 山本',
    media: '口頭',
    registeredDate: '2026-06-24',
    memo: '後で記録必要',
    completed: false,
  },
]

const importanceMeta: Record<Importance, { text: string; className: string; bg: string; border: string }> = {
  red: { text: '!', className: 'badge-red', bg: '#FFEBEE', border: '#E53935' },
  orange: { text: '★', className: 'badge-orange', bg: '#FFF3E0', border: '#FB8C00' },
  yellow: { text: '!', className: 'badge-yellow', bg: '#FFFDE7', border: '#FDD835' },
  green: { text: '−', className: 'badge-green', bg: '#E8F5E9', border: '#43A047' },
  blue: { text: '＋', className: 'badge-blue', bg: '#E3F2FD', border: '#1976D2' },
}

function formatDisplayValue(value: string, isDateTime: boolean) {
  if (!value) return '未設定'
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/)
  if (!match) return value

  const [, year, month, day, hour = '00', minute = '00'] = match
  return isDateTime ? `${year}/${month}/${day} ${hour}:${minute}` : `${year}/${month}/${day}`
}

function parseValue(value: string, isDateTime: boolean) {
  if (!value) return Number.POSITIVE_INFINITY
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/)
  if (!match) return Number.POSITIVE_INFINITY

  const [, year, month, day, hour = '00', minute = '00'] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  return date.getTime()
}

export default function HomePage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<'importance' | 'deadline' | 'register'>('importance')
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [memoTargetId, setMemoTargetId] = useState<number | null>(null)
  const [memoDraft, setMemoDraft] = useState('')
  const [editingField, setEditingField] = useState<{ id: number; kind: 'deadline' | 'scheduled' | 'registered' } | null>(null)

  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks])
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks])

  const visibleActiveTasks = useMemo(() => {
    const query = search.toLowerCase()
    const filtered = activeTasks.filter((task) => {
      const haystack = `${task.taskName} ${task.requester} ${task.memo}`.toLowerCase()
      return haystack.includes(query)
    })

    const sorted = [...filtered]
    if (sortMode === 'importance') {
      const rank: Record<Importance, number> = { red: 1, orange: 2, yellow: 3, green: 4, blue: 5 }
      sorted.sort((a, b) => rank[a.importance] - rank[b.importance])
    } else if (sortMode === 'deadline') {
      sorted.sort((a, b) => parseValue(a.deadline, true) - parseValue(b.deadline, true))
    } else {
      sorted.sort((a, b) => parseValue(a.registeredDate, false) - parseValue(b.registeredDate, false))
    }
    return sorted
  }, [activeTasks, search, sortMode])

  const visibleCompletedTasks = useMemo(() => {
    const query = search.toLowerCase()
    return completedTasks.filter((task) => {
      const haystack = `${task.taskName} ${task.requester} ${task.memo}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [completedTasks, search])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMemoTargetId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const updateTask = (id: number, updater: (task: Task) => Task) => {
    setTasks((current) => current.map((task) => (task.id === id ? updater(task) : task)))
  }

  const toggleCompletion = (id: number) => {
    updateTask(id, (task) => ({ ...task, completed: !task.completed }))
  }

  const deleteSelected = () => {
    setTasks((current) => current.filter((task) => !selectedIds.includes(task.id)))
    setSelectedIds([])
    setDeleteMode(false)
  }

  const addTask = () => {
    const nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1
    const newTask: Task = {
      id: nextId,
      importance: 'blue',
      deadline: '',
      scheduledDate: '',
      taskName: '',
      requester: '',
      media: 'メール',
      registeredDate: '',
      memo: '',
      completed: false,
    }
    setTasks((current) => [...current, newTask])
  }

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev)
    setSelectedIds([])
  }

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const openMemo = (id: number) => {
    const task = tasks.find((item) => item.id === id)
    if (!task || deleteMode) return
    setMemoTargetId(id)
    setMemoDraft(task.memo)
  }

  const saveMemo = () => {
    if (memoTargetId === null) return
    updateTask(memoTargetId, (task) => ({ ...task, memo: memoDraft }))
    setMemoTargetId(null)
  }

  const cancelMemo = () => setMemoTargetId(null)

  const renderMemoPreview = (task: Task) => {
    const text = task.memo.trim()
    const short = text.length > 7 ? `${text.slice(0, 7)}…` : text
    return (
      <span className={`memo-short${text ? '' : ' empty'}`}>
        {text ? short : '（なし）'}
      </span>
    )
  }

  const taskRow = (task: Task) => (
    <tr key={task.id} className={selectedIds.includes(task.id) ? 'delete-target' : ''} onClick={(event) => {
      if (!deleteMode) return
      const target = event.target as HTMLElement
      if (target.closest('button, input, select, .memo-cell, .date-display, .media-display, [contenteditable="true"], .importance-wrapper')) {
        return
      }
      toggleSelection(task.id)
    }}>
      <td>
        <input
          type="checkbox"
          className="task-check"
          checked={task.completed}
          onChange={() => toggleCompletion(task.id)}
          disabled={deleteMode}
        />
      </td>
      <td>
        <div className="importance-wrapper" style={{ background: importanceMeta[task.importance].bg, borderColor: importanceMeta[task.importance].border }}>
          <span className={`badge ${importanceMeta[task.importance].className}`}>{importanceMeta[task.importance].text}</span>
          <select
            className="importance-select"
            value={task.importance}
            onChange={(event) => updateTask(task.id, (item) => ({ ...item, importance: event.target.value as Importance }))}
            disabled={deleteMode}
          >
            <option value="red">最優先（!）</option>
            <option value="orange">高（★）</option>
            <option value="yellow">中（!）</option>
            <option value="green">低（−）</option>
            <option value="blue">参考（＋）</option>
          </select>
        </div>
      </td>
      <td>
        {editingField?.id === task.id && editingField.kind === 'deadline' ? (
          <input
            type="datetime-local"
            className="hidden-date-input"
            value={task.deadline}
            onChange={(event) => updateTask(task.id, (item) => ({ ...item, deadline: event.target.value }))}
            onBlur={() => setEditingField(null)}
            autoFocus
            style={{ display: 'inline-block' }}
          />
        ) : (
          <span
            className="date-display"
            onClick={() => {
              if (!deleteMode) setEditingField({ id: task.id, kind: 'deadline' })
            }}
          >
            {formatDisplayValue(task.deadline, true)}
          </span>
        )}
      </td>
      <td>
        {editingField?.id === task.id && editingField.kind === 'scheduled' ? (
          <input
            type="date"
            className="hidden-date-input"
            value={task.scheduledDate}
            onChange={(event) => updateTask(task.id, (item) => ({ ...item, scheduledDate: event.target.value }))}
            onBlur={() => setEditingField(null)}
            autoFocus
            style={{ display: 'inline-block' }}
          />
        ) : (
          <span
            className="date-display"
            onClick={() => {
              if (!deleteMode) setEditingField({ id: task.id, kind: 'scheduled' })
            }}
          >
            {formatDisplayValue(task.scheduledDate, false)}
          </span>
        )}
      </td>
      <td
        contentEditable={!deleteMode}
        suppressContentEditableWarning
        onBlur={(event) => updateTask(task.id, (item) => ({ ...item, taskName: event.currentTarget.textContent || '' }))}
      >
        {task.taskName}
      </td>
      <td
        contentEditable={!deleteMode}
        suppressContentEditableWarning
        onBlur={(event) => updateTask(task.id, (item) => ({ ...item, requester: event.currentTarget.textContent || '' }))}
      >
        {task.requester}
      </td>
      <td>
        {task.media ? (
          <>
            <span className="media-display" onClick={() => !deleteMode && setEditingField({ id: task.id, kind: 'registered' })}>
              {task.media}
            </span>
            <select
              className="media-select hidden-media-select"
              value={task.media}
              onChange={(event) => updateTask(task.id, (item) => ({ ...item, media: event.target.value }))}
              style={{ display: editingField?.id === task.id && editingField.kind === 'registered' ? 'inline-block' : 'none' }}
              onBlur={() => setEditingField(null)}
              autoFocus
            >
              <option value="メール">メール</option>
              <option value="Teams">Teams</option>
              <option value="口頭">口頭</option>
              <option value="その他">その他</option>
            </select>
          </>
        ) : null}
      </td>
      <td>
        {editingField?.id === task.id && editingField.kind === 'registered' ? (
          <input
            type="date"
            className="hidden-date-input"
            value={task.registeredDate}
            onChange={(event) => updateTask(task.id, (item) => ({ ...item, registeredDate: event.target.value }))}
            onBlur={() => setEditingField(null)}
            autoFocus
            style={{ display: 'inline-block' }}
          />
        ) : (
          <span
            className="date-display"
            onClick={() => {
              if (!deleteMode) setEditingField({ id: task.id, kind: 'registered' })
            }}
          >
            {formatDisplayValue(task.registeredDate, false)}
          </span>
        )}
      </td>
      <td className="memo-cell" onDoubleClick={() => openMemo(task.id)}>
        {renderMemoPreview(task)}
      </td>
    </tr>
  )

  return (
    <>
      <style jsx global>{`
        body {
          font-family: "M PLUS Rounded 1c", sans-serif;
          background: #f2f5fa;
          margin: 0;
          padding: 0;
          color: #333;
        }

        .topbar {
          height: 64px;
          background: #1976D2;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .topbar-left {
          font-size: 20px;
          font-weight: 600;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 14px;
        }
        .topbar-icon {
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .delete-btn {
          padding: 6px 14px;
          background: #e53935;
          color: #fff;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .delete-target {
          background: #ffebee !important;
          border: 2px solid #e53935 !important;
        }
        .content {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .content-sort {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sort-btn {
          padding: 6px 14px;
          border-radius: 20px;
          border: none;
          background: #fff;
          color: #1976D2;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .sort-btn:hover {
          background: #e3f2fd;
          transform: translateY(-2px);
        }
        .search-input {
          padding: 8px 14px;
          border-radius: 20px;
          border: 2px solid #1976D2;
          font-size: 14px;
          width: 220px;
          outline: none;
          background: #fff;
        }
        .task-table-wrapper,
        .completed-wrapper {
          background: #fff;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 8px;
        }
        thead th {
          padding: 8px 10px;
          font-size: 13px;
          color: #555;
        }
        tbody tr {
          background: #fdfdfd;
          border-radius: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          transition: transform 0.1s ease, box-shadow 0.2s ease;
        }
        tbody tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        td {
          padding: 12px 10px;
          font-size: 14px;
        }
        tbody tr td:first-child {
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }
        tbody tr td:last-child {
          border-top-right-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        .badge {
          width: 26px;
          height: 26px;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
        }
        .badge-red { background: #E53935; }
        .badge-orange { background: #FB8C00; }
        .badge-yellow { background: #FDD835; color: #333; }
        .badge-green { background: #43A047; }
        .badge-blue { background: #1976D2; }
        .importance-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #E3F2FD;
          border: 2px solid #1976D2;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
        }
        .importance-select {
          border: none;
          background: transparent;
          font-size: 14px;
          font-family: "M PLUS Rounded 1c";
          color: #1976D2;
          cursor: pointer;
          outline: none;
        }
        .date-display,
        .media-display {
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 12px;
          background: #f1f5fb;
        }
        .hidden-date-input,
        .hidden-media-select {
          display: none;
        }
        .add-row-btn {
          margin-top: 16px;
          padding: 10px 20px;
          background: #1976D2;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .completed-wrapper {
          margin-top: 24px;
          max-height: 260px;
          overflow-y: auto;
        }
        .legend {
          margin-top: 16px;
          font-size: 13px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .memo-cell {
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
        }
        .memo-short {
          display: inline-block;
          font-size: 13px;
          color: #1976D2;
          background: #E3F2FD;
          border: 1.5px solid #90CAF9;
          border-radius: 14px;
          padding: 4px 10px;
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          user-select: none;
        }
        .memo-short.empty {
          color: #90CAF9;
          background: #F5F9FF;
          border-color: #BBDEFB;
        }
        .memo-overlay {
          display: flex;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .memo-overlay.hidden {
          display: none;
        }
        .memo-modal {
          background: #fff;
          border-radius: 24px;
          width: 560px;
          max-width: 92vw;
          box-shadow: 0 12px 40px rgba(0,0,0,0.22);
          overflow: hidden;
          position: relative;
        }
        .memo-modal-header {
          background: #1976D2;
          padding: 16px 20px 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .memo-modal-title {
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .memo-modal-title::before {
          content: "📝";
          font-size: 17px;
        }
        .memo-modal-close {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: none;
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .memo-modal-body {
          padding: 24px;
          background: #F5F9FF;
        }
        .memo-modal-textarea {
          width: 100%;
          min-height: 200px;
          border: 2px solid #90CAF9;
          border-radius: 18px;
          padding: 16px 18px;
          font-size: 15px;
          font-family: "M PLUS Rounded 1c", sans-serif;
          color: #333;
          background: #fff;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
          line-height: 1.8;
        }
        .memo-modal-footer {
          padding: 16px 24px 20px;
          background: #F5F9FF;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .memo-save-btn {
          padding: 10px 32px;
          background: #1976D2;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 700;
          font-family: "M PLUS Rounded 1c", sans-serif;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(25,118,210,0.3);
        }
        .memo-cancel-btn {
          padding: 10px 24px;
          background: #fff;
          color: #888;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: "M PLUS Rounded 1c", sans-serif;
          cursor: pointer;
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-left">タスク一覧</div>
        <div className="topbar-right">
          <div className="topbar-icon">🔔</div>
          <div className="topbar-icon">🔄</div>
          <button className="topbar-icon" onClick={toggleDeleteMode} style={{ border: 'none', color: '#fff' }}>🗑</button>
          <button className="delete-btn" onClick={deleteSelected} style={{ display: deleteMode ? 'inline-block' : 'none' }}>削除確定</button>
          <button className="delete-btn" onClick={() => { setDeleteMode(false); setSelectedIds([]) }} style={{ display: deleteMode ? 'inline-block' : 'none' }}>キャンセル</button>
          <div className="topbar-user">
            <div className="topbar-avatar">加藤葵</div>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="content-header">
          <div className="content-sort">
            <button className="sort-btn" onClick={() => setSortMode('importance')}>重要度が高い順</button>
            <button className="sort-btn" onClick={() => setSortMode('deadline')}>締切が早い順</button>
            <button className="sort-btn" onClick={() => setSortMode('register')}>登録日が早い順</button>
          </div>
          <input className="search-input" placeholder="検索…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        <section className="task-table-wrapper">
          <table id="task-table">
            <thead>
              <tr>
                <th>完了</th>
                <th>重要度</th>
                <th>期限</th>
                <th>実行予定日</th>
                <th>タスク名</th>
                <th>依頼元</th>
                <th>媒体</th>
                <th>登録日</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>{visibleActiveTasks.map(taskRow)}</tbody>
          </table>
        </section>

        <button className="add-row-btn" onClick={addTask}>＋ 行を追加</button>

        <section className="completed-wrapper">
          <h3>完了したタスク一覧</h3>
          <table id="completed-table">
            <thead>
              <tr>
                <th>完了</th>
                <th>重要度</th>
                <th>期限</th>
                <th>実行予定日</th>
                <th>タスク名</th>
                <th>依頼元</th>
                <th>媒体</th>
                <th>登録日</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>{visibleCompletedTasks.map(taskRow)}</tbody>
          </table>
        </section>

        <section className="legend">
          <div className="legend-item"><span className="badge badge-red">!</span>最優先</div>
          <div className="legend-item"><span className="badge badge-orange">★</span>高</div>
          <div className="legend-item"><span className="badge badge-yellow">!</span>中</div>
          <div className="legend-item"><span className="badge badge-green">−</span>低</div>
          <div className="legend-item"><span className="badge badge-blue">＋</span>参考</div>
        </section>
      </main>

      <div className={`memo-overlay${memoTargetId === null ? ' hidden' : ''}`} onClick={(event) => {
        if (event.target === event.currentTarget) cancelMemo()
      }}>
        <div className="memo-modal">
          <div className="memo-modal-header">
            <div className="memo-modal-title">メモ</div>
            <button className="memo-modal-close" onClick={cancelMemo}>✕</button>
          </div>
          <div className="memo-modal-body">
            <textarea className="memo-modal-textarea" value={memoDraft} onChange={(event) => setMemoDraft(event.target.value)} />
          </div>
          <div className="memo-modal-footer">
            <button className="memo-cancel-btn" onClick={cancelMemo}>キャンセル</button>
            <button className="memo-save-btn" onClick={saveMemo}>保存</button>
          </div>
        </div>
      </div>
    </>
  )
}
