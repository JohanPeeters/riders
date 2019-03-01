function makeSealerUnsealerPair() {
      var boxValues = new WeakMap();

      const seal = value => {
        var box = Object.freeze({});
        boxValues.set(box, value);
        return box;
      }
      const optUnseal = box => {
        return boxValues.has(box) ? [boxValues.get(box)] : null;
      }
      const unseal = box => {
        var result = optUnseal(box);
        if (result === null) {
          // not sure why traditionally the box terminology is adopted. I will
          // keep it for now, but in communication to the client I use the term
          // 'key' as that should require less explaining and hand-waving.
          throw new Error("Key does not fit");
        } else {
          return result[0];
        }
      }
      return Object.freeze({
        seal: seal,
        unseal: unseal,
        optUnseal: optUnseal
      });
    }

  export default makeSealerUnsealerPair()
