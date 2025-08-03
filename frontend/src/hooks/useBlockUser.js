"use client"

import { useState } from "react"

export const useBlockUser = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const blockUser = async (username, reason = "") => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/chat/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username, reason }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to block user")
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unblockUser = async (username) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/chat/unblock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to unblock user")
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { blockUser, unblockUser, loading, error }
}
