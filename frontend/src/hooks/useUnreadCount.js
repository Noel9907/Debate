"use client"

import { useState, useEffect } from "react"

export const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUnreadCount = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/chat/unread-count", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch unread count")
      }

      setUnreadCount(data.unread_count)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
  }, [])

  return { unreadCount, loading, error, refetch: fetchUnreadCount }
}
