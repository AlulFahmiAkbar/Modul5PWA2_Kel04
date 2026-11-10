import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Reusable Pagination component
 *
 * @param {Object} props
 * @param {number} props.currentPage
 * @param {number} props.totalPages
 * @param {Function} props.onPageChange
 * @param {number} props.totalItems
 * @param {number} props.startIndex
 * @param {number} props.endIndex
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
}) {
  if (totalPages <= 1) return null

  // Generate numbered buttons with ellipsis
  const getPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="pagination-wrap">
      <div className="pagination-info">
        Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong> -{' '}
        <strong>{Math.min(endIndex, totalItems)}</strong> of{' '}
        <strong>{totalItems}</strong> items
      </div>

      <nav className="pagination-controls" aria-label="Pagination Navigation">
        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  …
                </span>
              )
            }
            return (
              <button
                key={page}
                type="button"
                className={`pagination-btn pagination-num ${
                  currentPage === page ? 'pagination-btn--active' : ''
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  )
}

