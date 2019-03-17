const makeVault = () => {
      const map = new WeakMap()

      const seal = secret => {
        let key = Object.freeze({})
        map.set(key, secret)
        return key
      }
      const optUnseal = key => {
        return map.has(key) ? map.get(key) : null
      }
      const unseal = key => {
        let result = optUnseal(key)
        if (result === null) {
          throw new Error("Key does not fit")
        } else {
          return result
        }
      }
      return Object.freeze({
        seal: seal,
        unseal: unseal,
        optUnseal: optUnseal
      })
  }

  export default makeVault
