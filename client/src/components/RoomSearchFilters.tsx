import React, { useState } from 'react'

interface RoomSearchFiltersProps {
  onSearchChange: (search: string) => void
  onFilterChange: (filters: {
    status: 'all' | 'waiting' | 'playing'
    sortBy: 'name' | 'players' | 'recent'
  }) => void
}

export default function RoomSearchFilters({ onSearchChange, onFilterChange }: RoomSearchFiltersProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'playing'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'players' | 'recent'>('recent')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    onSearchChange(value)
  }

  const handleStatusChange = (status: 'all' | 'waiting' | 'playing') => {
    setStatusFilter(status)
    onFilterChange({ status, sortBy })
  }

  const handleSortChange = (sort: 'name' | 'players' | 'recent') => {
    setSortBy(sort)
    onFilterChange({ status: statusFilter, sortBy: sort })
  }

  return (
    <div className="room-search-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div className="filters-row">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusChange('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'waiting' ? 'active' : ''}`}
            onClick={() => handleStatusChange('waiting')}
          >
            Waiting
          </button>
          <button
            className={`filter-btn ${statusFilter === 'playing' ? 'active' : ''}`}
            onClick={() => handleStatusChange('playing')}
          >
            Playing
          </button>
        </div>
        <div className="filter-group">
          <span className="filter-label">Sort:</span>
          <button
            className={`filter-btn ${sortBy === 'recent' ? 'active' : ''}`}
            onClick={() => handleSortChange('recent')}
          >
            Recent
          </button>
          <button
            className={`filter-btn ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => handleSortChange('name')}
          >
            Name
          </button>
          <button
            className={`filter-btn ${sortBy === 'players' ? 'active' : ''}`}
            onClick={() => handleSortChange('players')}
          >
            Players
          </button>
        </div>
      </div>
    </div>
  )
}

