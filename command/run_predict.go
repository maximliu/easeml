package command

import (
	"github.com/ds3lab/easeml/modules"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var runPredictData, runPredictMemory, runPredictOutput string

var runPredictCmd = &cobra.Command{
	Use:   "predict [image]",
	Short: "Runs a predict command on a model given its docker image.",
	Long:  ``,
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {

		modelImageName := args[0]

		// Ensure all input parameters point to existing files and folders.
		if _, err := os.Stat(runPredictData); os.IsNotExist(err) {
			fmt.Printf("Data path \"%s\" doesn't exist.\n", runPredictData)
			return
		}
		if _, err := os.Stat(runPredictMemory); os.IsNotExist(err) {
			fmt.Printf("Memory path \"%s\" doesn't exist.\n", runPredictMemory)
			return
		}
		if _, err := os.Stat(runPredictOutput); os.IsNotExist(err) {
			fmt.Printf("Output path \"%s\" doesn't exist.\n", runPredictOutput)
			return
		}

		command := []string{
			"predict",
			"--data", modules.MntPrefix + runPredictData,
			"--memory", modules.MntPrefix + runPredictMemory,
			"--output", modules.MntPrefix + runPredictOutput,
		}
		outReader, err := modules.RunContainerAndCollectOutput(modelImageName, nil, command)
		if err != nil {
			fmt.Println("Error while running the container: ")
			fmt.Print(err)
		}
		defer outReader.Close()

		// Read the output reader and write it to stdout.
		predictLogData, err := ioutil.ReadAll(outReader)
		fmt.Print(string(predictLogData))

	},
}

func init() {
	runCmd.AddCommand(runPredictCmd)

	//loginCmd.PersistentFlags().BoolVarP(&saveAPIKey, "save", "s", false, "Write the resulting API key to the config file.")

	runPredictCmd.Flags().StringVarP(&runPredictData, "data", "d", "", "Directory containing the input data.")
	runPredictCmd.Flags().StringVarP(&runPredictMemory, "memory", "m", "", "Model memory.")
	runPredictCmd.Flags().StringVarP(&runPredictOutput, "output", "o", "", "Directory where the model will output its predictions.")

	viper.BindPFlags(runPredictCmd.PersistentFlags())

}
